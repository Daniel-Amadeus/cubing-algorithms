precision highp float;

// Adapted from https://github.com/KhronosGroup/glTF-WebGL-PBR

@import ./facade.vert;

const int HAS_NORMALS           = 1;
const int HAS_TANGENTS          = 1 << 1;
const int HAS_UV                = 1 << 2;
const int HAS_COLORS            = 1 << 3;

#if __VERSION__ == 100
    attribute vec4 a_position;
    attribute vec4 a_normal;
    attribute vec4 a_tangent;
    attribute vec2 a_texcoord_0;
    attribute vec2 a_texcoord_1;
    attribute vec2 a_texcoord_2;
    attribute vec4 a_joints;
    attribute vec4 a_weights;
    attribute vec4 a_color;
#else
    layout (location = 0) in vec4 a_position;
    layout (location = 1) in vec3 a_normal;
    layout (location = 2) in vec4 a_tangent;
    layout (location = 3) in vec2 a_texcoord_0;
    layout (location = 4) in vec2 a_texcoord_1;
    layout (location = 5) in vec2 a_texcoord_2;
    layout (location = 6) in vec4 a_joints;
    layout (location = 7) in vec4 a_weights;
    layout (location = 8) in vec4 a_color;
#endif

uniform mat4 u_model;
uniform mat4 u_viewProjection;
uniform mat3 u_normalMatrix;

uniform mediump int u_geometryFlags;

const vec3 u_objectDimensions = vec3(1.0);

uniform float u_moldFactor;
uniform float u_pinchFactor;
uniform float u_twistAngle;
uniform float u_bendAngle;

varying vec2 v_uv[3];
varying vec4 v_color;
varying vec3 v_position;

varying mat3 v_TBN;
varying vec3 v_normal;

const float M_PI = 3.141592653589793;

bool checkFlag(int flag) {
    return (u_geometryFlags & flag) == flag;
}

vec4 mold(vec4 vertex, float factor)
{
    //////////////////////////////////////////////////////////////////////////////////////////////////
    // TODO:
    // Apply a mold deformation to the given vertex.
    // Take into account the factor parameter
    //      0.0: No deformation at all
    //      1.0: Maximum deformation
    // Tip: Use u_objectDimensions to get the extents of the x, y and z dimension
    // Tip: Keep in mind that the modell is located in the coordinate system origin
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // TA: remove begin
    float signZ = sign(vertex.z);

    vec2 n = vec2(0.0, signZ);
    float t = min(1.0, (acos(dot(n, vertex.xz)/(length(n)*length(vertex.xz)))) - (1.0 - factor));
    float newZ = (1.0 - t) * u_objectDimensions.z;
    vertex.z = signZ * min(signZ * vertex.z, newZ);
    // TA: remove end
    return vertex;
}

vec4 pinch(vec4 vertex, float factor)
{
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // TODO:
    // Apply a pinch deformation to the given vertex.
    // Take into account the factor parameter
    //      0.0: No deformation at all
    //      1.0: Maximum deformation
    // Tip: Use u_objectDimensions to get the extents of the x, y and z dimension
    // Tip: Keep in mind that the model is located in the coordinate system origin
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // TA: remove begin
    float pinchThreshold = mix(1.0, (1.0 - u_pinchFactor), (v_position.y + u_objectDimensions.y * 0.5));
    float signX = sign(vertex.x);
    vertex.x = signX * min(signX * vertex.x, pinchThreshold);
    // TA: remove end
    return vertex;
}

vec4 twist(vec4 vertex, float angle)
{
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // TODO:
    // Apply a twist deformation to the given vertex.
    // Take into account the angle parameter, that defines the maximum rotation angle
    // Tip: Use u_objectDimensions to get the extents of the x, y and z dimension
    // Tip: Keep in mind that the model is located in the coordinate system origin
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // TA: remove begin
    float twistAngle = angle * (vertex.y + u_objectDimensions.y);
    float twistAngleCos = cos(twistAngle);
    float twistAngleSin = sin(twistAngle);
    mat4 twistMatrix = mat4(
        twistAngleCos, 0.0, -twistAngleSin, 0.0,
                  0.0, 1.0,            0.0, 0.0,
        twistAngleSin, 0.0,  twistAngleCos, 0.0,
                  0.0, 0.0,            0.0, 1.0
    );
    vertex = twistMatrix * vertex;
    // TA: remove end
    return vertex;
}

vec4 bend(vec4 vertex, float angle)
{
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // TODO:
    // Apply a bend deformation to the given vertex.
    // Take into account the angle parameter, that defines the maximum rotation angle
    // Tip: Use u_objectDimensions to get the extents of the x, y and z dimension
    // Tip: Keep in mind that the model is located in the coordinate system origin
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // TA: remove begin
    float f = (u_objectDimensions.y*0.5f + vertex.y)/u_objectDimensions.y;

    // rotate around z-axis
    mat4 A = mat4(
        cos(f*angle) , sin(f*angle), 0, 0,
        -sin(f*angle), cos(f*angle), 0, 0,
        0            , 0           , 1, 0,
        0            , 0           , 0, 1);

    vertex = A * vertex;
    // TA: remove end
    return vertex;
}

void main(void)
{
    vec4 pos = u_model * a_position;
    v_position = vec3(pos.xyz) / pos.w;

    if (checkFlag(HAS_NORMALS)) {
        if (checkFlag(HAS_TANGENTS)) {
            vec3 normalW = normalize(vec3(u_normalMatrix * a_normal));
            vec3 tangentW = normalize(vec3(u_model * vec4(a_tangent.xyz, 0.0)));
            vec3 bitangentW = cross(normalW, tangentW) * a_tangent.w;
            v_TBN = mat3(tangentW, bitangentW, normalW);
        } else { // HAS_TANGENTS != 1
            v_normal = normalize(vec3(u_model * vec4(a_normal.xyz, 0.0)));
        }
    }

    if (checkFlag(HAS_UV)) {
        v_uv[0] = a_texcoord_0;
        v_uv[1] = a_texcoord_1;
        v_uv[2] = a_texcoord_2;
    } else {
        v_uv[0] = vec2(0., 0.);
        v_uv[1] = vec2(0., 0.);
        v_uv[2] = vec2(0., 0.);
    }

    if (checkFlag(HAS_COLORS)) {
        v_color = a_color;
    } else {
        v_color = vec4(1.0);
    }

    vec4 vertex = mold(a_position, u_moldFactor);
    vertex = pinch(vertex, u_pinchFactor);
    vertex = twist(vertex, u_twistAngle);
    vertex = bend(vertex, u_bendAngle);

    gl_Position = u_viewProjection * u_model * vertex;
}
