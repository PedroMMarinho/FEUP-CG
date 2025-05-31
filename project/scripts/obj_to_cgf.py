import os
import sys

obj_name = "heli"
blender_path = "project/blender/"

# Configuration
obj_file_path = blender_path + obj_name + ".obj"
output_js_path = "project/scripts/" + obj_name + ".js"
mtl_file_path = blender_path + obj_name + ".mtl"

# Data structures
vertices = []
texcoords = []
normals = []
faces = []
materials = {}  # Will store material properties from MTL

# Object and material tracking
objects = {}  # Maps object name to information
current_object = "default"  # Default object name if none specified
current_material = None

def triangulate_face(face_vertices):
    """Convert an n-vertex face to triangles using fan triangulation"""
    triangles = []
    for i in range(1, len(face_vertices) - 1):
        triangles.append([face_vertices[0], face_vertices[i], face_vertices[i+1]])
    return triangles

def parse_mtl_file(mtl_path):
    """Parse MTL file and return materials dictionary"""
    if not os.path.exists(mtl_path):
        print(f"Warning: MTL file not found: {mtl_path}")
        return {}
        
    mtl_materials = {}
    current_mtl = None
    
    with open(mtl_path, "r") as file:
        for line in file:
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
                
            parts = line.split()
            if not parts:
                continue
                
            cmd = parts[0].lower()
            
            if cmd == "newmtl":
                current_mtl = parts[1]
                mtl_materials[current_mtl] = {
                    "ambient": [0.2, 0.2, 0.2, 1.0],  # Ka
                    "diffuse": [0.8, 0.8, 0.8, 1.0],  # Kd
                    "specular": [0.0, 0.0, 0.0, 1.0], # Ks
                    "shininess": 0.0,                 # Ns
                    "transparency": 1.0,              # 1.0 - Tf/d
                    "textures": {}                    # Map_* directives
                }
            elif cmd == "ka" and current_mtl:  # Ambient color
                mtl_materials[current_mtl]["ambient"] = [float(parts[1]), float(parts[2]), float(parts[3]), 1.0]
            elif cmd == "kd" and current_mtl:  # Diffuse color
                mtl_materials[current_mtl]["diffuse"] = [float(parts[1]), float(parts[2]), float(parts[3]), 1.0]
            elif cmd == "ks" and current_mtl:  # Specular color
                mtl_materials[current_mtl]["specular"] = [float(parts[1]), float(parts[2]), float(parts[3]), 1.0]
            elif cmd == "ns" and current_mtl:  # Shininess
                mtl_materials[current_mtl]["shininess"] = float(parts[1])
            elif cmd == "d" and current_mtl:   # Dissolve (opacity)
                mtl_materials[current_mtl]["transparency"] = float(parts[1])
            elif cmd == "tr" and current_mtl:  # Transparency (inverted)
                mtl_materials[current_mtl]["transparency"] = 1.0 - float(parts[1])
            elif cmd == "tf" and current_mtl:  # Transmission filter (transparency)
                # Usually Tf has 3 values but we'll average them for a single transparency value
                if len(parts) >= 4:
                    avg_tf = (float(parts[1]) + float(parts[2]) + float(parts[3])) / 3.0
                    mtl_materials[current_mtl]["transparency"] = avg_tf
            elif cmd == "ni" and current_mtl:  # Optical density (refractive index)
                # We don't use this in WebCGF but store it anyway
                mtl_materials[current_mtl]["refraction_index"] = float(parts[1])
            elif cmd == "illum" and current_mtl:  # Illumination model
                # We don't use this directly in WebCGF but store it
                mtl_materials[current_mtl]["illum_model"] = int(parts[1])
            elif cmd.startswith("map_") and current_mtl:  # Texture maps
                # Handle different texture types
                texture_type = cmd[4:]  # Remove "map_" prefix
                texture_path = " ".join(parts[1:])  # Join all remaining parts as the path
                mtl_materials[current_mtl]["textures"][texture_type] = texture_path
    return mtl_materials

try:
    if not os.path.exists(obj_file_path):
        raise FileNotFoundError(f"OBJ file not found: {obj_file_path}")
    
    # Initialize object tracking
    objects[current_object] = {
        "faces": [],
        "materials": {}  # Maps material name to list of face indices
    }
        
    with open(obj_file_path, "r") as file:
        for line in file:
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
                
            parts = line.split()
            if not parts:
                continue
                
            cmd = parts[0]
            
            if cmd == "v":  # Vertex position
                vertices.append(tuple(map(float, parts[1:4])))
            elif cmd == "vt":  # Texture coordinate
                if len(parts) >= 3:
                    # IMPORTANT: Flip the V coordinate for WebGL compatibility
                    texcoords.append((float(parts[1]), 1.0 - float(parts[2])))
                elif len(parts) >= 2:
                    # If only U is provided, default V to 0 and flip
                    texcoords.append((float(parts[1]), 1.0))
            elif cmd == "vn":  # Normal vector
                normals.append(tuple(map(float, parts[1:4])))
            elif cmd == "o" or cmd == "g":  # Object or Group
                # Begin a new object section
                current_object = " ".join(parts[1:])
                if current_object not in objects:
                    objects[current_object] = {
                        "faces": [],
                        "materials": {}  # Maps material name to list of face indices
                    }
            elif cmd == "usemtl":  # Material assignment
                current_material = parts[1]
                # Make sure the material exists in the current object's materials dict
                if current_material not in objects[current_object]["materials"]:
                    objects[current_object]["materials"][current_material] = []
            elif cmd == "f":  # Face
                vertex_data = []
                for part in parts[1:]:
                    indices = part.split('/')
                    
                    # OBJ indices start at 1, convert to 0-based
                    v_idx = int(indices[0]) - 1 if indices[0] else None
                    
                    # Handle texture coordinates - ensure they're properly parsed
                    vt_idx = None
                    if len(indices) > 1 and indices[1]:
                        vt_idx = int(indices[1]) - 1
                    
                    # Handle normals
                    vn_idx = None
                    if len(indices) > 2 and indices[2]:
                        vn_idx = int(indices[2]) - 1
                    
                    vertex_data.append((v_idx, vt_idx, vn_idx))
                
                # Handle triangulation if needed
                if len(vertex_data) > 3:
                    triangulated = triangulate_face(vertex_data)
                    for tri in triangulated:
                        faces.append(tri)
                        face_idx = len(faces) - 1
                        
                        # Add face index to current object
                        objects[current_object]["faces"].append(face_idx)
                        
                        # Add face index to current material if specified
                        if current_material:
                            objects[current_object]["materials"][current_material].append(face_idx)
                else:
                    faces.append(vertex_data)
                    face_idx = len(faces) - 1
                    
                    # Add face index to current object
                    objects[current_object]["faces"].append(face_idx)
                    
                    # Add face index to current material if specified
                    if current_material:
                        objects[current_object]["materials"][current_material].append(face_idx)

                
    # Parse the MTL file if found
    if mtl_file_path:
        materials = parse_mtl_file(mtl_file_path)
    else:
        # Try to find MTL with same base name as OBJ
        possible_mtl = obj_name + ".mtl"
        if os.path.exists(possible_mtl):
            materials = parse_mtl_file(possible_mtl)
            print(f"Found and parsed MTL file: {possible_mtl}")
                
    # Generate unified WebCGF arrays
    js_vertices = []
    js_normals = []
    js_texcoords = []
    js_indices = []
    
    # Track where each face starts in the js_indices array
    face_to_js_index = {}
    
    index_map = {}
    next_index = 0
    
    # Process all faces, creating unified vertex data
    for face_idx, face in enumerate(faces):
        face_indices = []
        for triplet in face:
            v_idx, vt_idx, vn_idx = triplet
            
            # Create a unique key for this vertex combination
            vertex_key = triplet
            
            if vertex_key not in index_map:
                index_map[vertex_key] = next_index
                
                # Add vertex position
                js_vertices.extend(vertices[v_idx])
                
                # Add normal (or default)
                if vn_idx is not None and vn_idx < len(normals):
                    js_normals.extend(normals[vn_idx])
                else:
                    js_normals.extend([0, 0, 1])  # Default normal
                
                # Add texture coordinate (or default)
                if vt_idx is not None and vt_idx < len(texcoords):
                    js_texcoords.extend(texcoords[vt_idx])
                else:
                    js_texcoords.extend([0, 0])  # Default texcoord
                    
                next_index += 1
                
            face_indices.append(index_map[vertex_key])
        
        # Record where this face starts in the js_indices array
        face_to_js_index[face_idx] = len(js_indices)
        
        # Add indices for this face
        js_indices.extend(face_indices)
    
    # Process objects and their materials to create a more detailed structure
    js_objects = {}
    
    for obj_name, obj_data in objects.items():
        if not obj_data["faces"]:  # Skip empty objects
            continue
            
        # Create object entry
        js_objects[obj_name] = {
            "indexRanges": [],  # Will contain {start, count} for all faces of this object
            "materials": {}     # Will contain material-specific index ranges
        }
        
        # Process all faces for this object to find continuous index ranges
        prev_end = None
        start_idx = None
        current_range = None
        
        # Sort faces to help identify continuous ranges
        sorted_faces = sorted(obj_data["faces"])
        
        for face_idx in sorted_faces:
            js_start_idx = face_to_js_index[face_idx]
            # Determine how many indices this face contributes
            face_index_count = len(faces[face_idx])
            js_end_idx = js_start_idx + face_index_count - 1
            
            if start_idx is None:
                # Start a new range
                start_idx = js_start_idx
                current_range = {
                    "start": js_start_idx,
                    "faces": [face_idx]
                }
            elif js_start_idx == prev_end + 1:
                # Continue the current range
                current_range["faces"].append(face_idx)
            else:
                # Finish previous range and start a new one
                current_range["count"] = prev_end - current_range["start"] + 1
                js_objects[obj_name]["indexRanges"].append(current_range)
                
                # Start a new range
                start_idx = js_start_idx
                current_range = {
                    "start": js_start_idx,
                    "faces": [face_idx]
                }
            
            prev_end = js_end_idx
        
        # Add the last range if it exists
        if current_range:
            current_range["count"] = prev_end - current_range["start"] + 1
            js_objects[obj_name]["indexRanges"].append(current_range)
        
        # Process materials for this object
        for mat_name, mat_faces in obj_data["materials"].items():
            if not mat_faces:
                continue
                
            # Create material entry
            js_objects[obj_name]["materials"][mat_name] = []
            
            # Find continuous ranges for this material
            prev_end = None
            start_idx = None
            current_range = None
            
            # Sort material faces to help identify continuous ranges
            sorted_mat_faces = sorted(mat_faces)
            
            for face_idx in sorted_mat_faces:
                js_start_idx = face_to_js_index[face_idx]
                # Determine how many indices this face contributes
                face_index_count = len(faces[face_idx])
                js_end_idx = js_start_idx + face_index_count - 1
                
                if start_idx is None:
                    # Start a new range
                    start_idx = js_start_idx
                    current_range = {
                        "start": js_start_idx,
                        "faces": [face_idx]
                    }
                elif js_start_idx == prev_end + 1:
                    # Continue the current range
                    current_range["faces"].append(face_idx)
                else:
                    # Finish previous range and start a new one
                    current_range["count"] = prev_end - current_range["start"] + 1
                    js_objects[obj_name]["materials"][mat_name].append(current_range)
                    
                    # Start a new range
                    start_idx = js_start_idx
                    current_range = {
                        "start": js_start_idx,
                        "faces": [face_idx]
                    }
                
                prev_end = js_end_idx
            
            # Add the last range if it exists
            if current_range:
                current_range["count"] = prev_end - current_range["start"] + 1
                js_objects[obj_name]["materials"][mat_name].append(current_range)
    
    # Make sure output directory exists
    os.makedirs(os.path.dirname(output_js_path), exist_ok=True)
    
    # Write the JavaScript output file
    with open(output_js_path, "w") as out:
        out.write("// Generated from " + os.path.basename(obj_file_path) + "\n\n")
        
        out.write("export const vertices = [\n  " + ",\n  ".join([
            ", ".join(map(str, js_vertices[i:i+3])) 
            for i in range(0, len(js_vertices), 3)
        ]) + "\n];\n\n")
        
        out.write("export const normals = [\n  " + ",\n  ".join([
            ", ".join(map(str, js_normals[i:i+3])) 
            for i in range(0, len(js_normals), 3)
        ]) + "\n];\n\n")
        
        out.write("export const texCoords = [\n  " + ",\n  ".join([
            ", ".join(map(str, js_texcoords[i:i+2])) 
            for i in range(0, len(js_texcoords), 2)
        ]) + "\n];\n\n")
        
        out.write("export const indices = [\n  " + ",\n  ".join([
            ", ".join(map(str, js_indices[i:i+3])) 
            for i in range(0, len(js_indices), 3)
        ]) + "\n];\n\n")
        
        # Export object groups with their material assignments
        if js_objects:
            out.write("export const objectGroups = {\n")
            for obj_name, obj_info in js_objects.items():
                # Skip empty objects or objects without index ranges
                if not obj_info["indexRanges"]:
                    continue
                    
                out.write(f"  '{obj_name}': {{\n")
                
                # Write object index ranges
                out.write("    indexRanges: [\n")
                for range_info in obj_info["indexRanges"]:
                    out.write(f"      {{ startIndex: {range_info['start']}, count: {range_info['count']} }},\n")
                out.write("    ],\n")
                
                # Write material-specific index ranges
                if obj_info["materials"]:
                    out.write("    materials: {\n")
                    for mat_name, mat_ranges in obj_info["materials"].items():
                        out.write(f"      '{mat_name}': [\n")
                        for range_info in mat_ranges:
                            out.write(f"        {{ startIndex: {range_info['start']}, count: {range_info['count']} }},\n")
                        out.write("      ],\n")
                    out.write("    },\n")
                else:
                    out.write("    materials: {},\n")
                    
                out.write("  },\n")
            out.write("};\n\n")
        
        # Export material properties
        if materials:
            out.write("export const materials = {\n")
            for material_name, props in materials.items():
                out.write(f"  '{material_name}': {{\n")
                
                # Write ambient color
                out.write(f"    ambient: [{', '.join(map(str, props['ambient']))}],\n")
                
                # Write diffuse color
                out.write(f"    diffuse: [{', '.join(map(str, props['diffuse']))}],\n")
                
                # Write specular color
                out.write(f"    specular: [{', '.join(map(str, props['specular']))}],\n")
                
                # Write shininess
                out.write(f"    shininess: {props['shininess']},\n")
                
                # Write transparency
                out.write(f"    transparency: {props['transparency']},\n")
                
                # Write textures if any
                if props['textures']:
                    out.write("    textures: {\n")
                    for tex_type, tex_path in props['textures'].items():
                        out.write(f"      '{tex_type}': '{tex_path}',\n")
                    out.write("    },\n")
                else:
                    out.write("    textures: {},\n")
                    
                out.write("  },\n")
            out.write("};\n")

    # Print summary
    print(f"Successfully processed {len(vertices)} vertices, {len(texcoords)} texture coordinates, {len(normals)} normals")
    print(f"Processed {len(faces)} faces")
    print(f"Generated {len(js_vertices)//3} unified vertices")
    print(f"Processed {len(objects)} separate objects")
    if materials:
        print(f"Processed {len(materials)} materials")
    print(f"Output written to {output_js_path}")
            
except Exception as e:
    print(f"Error processing files: {e}", file=sys.stderr)
    sys.exit(1)