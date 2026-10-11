#include <metal_stdlib>
using namespace metal;

struct BraceletVertex { float3 position; float3 normal; float4 color; };
struct Uniforms { float4x4 projection; float4x4 model; };
struct RasterVertex {
    float4 position [[position]];
    float3 normal;
    float3 local;
    float4 color;
};
vertex RasterVertex braceletVertex(uint index [[vertex_id]],
    const device BraceletVertex* vertices [[buffer(0)]], constant Uniforms& uniforms [[buffer(1)]]) {
    BraceletVertex v = vertices[index];
    RasterVertex result;
    result.position = uniforms.projection * uniforms.model * float4(v.position, 1);
    result.normal = normalize((uniforms.model * float4(v.normal, 0)).xyz);
    result.local = v.position;
    result.color = v.color;
    return result;
}
fragment float4 braceletFragment(RasterVertex in [[stage_in]]) {
    float3 n = normalize(in.normal);
    float3 light = normalize(float3(-0.4, 0.7, 1.0));
    float diffuse = 0.45 + 0.55 * max(dot(n, light), 0.0);
    float grain = 1;
    if (in.color.w > 0.5 && in.color.w < 1.5)
        grain = 0.88 + 0.12 * sin(in.local.y * 110 + sin(in.local.z * 34) * 2);
    if (in.color.w > 1.5 && in.color.w < 2.5)
        grain = 0.91 + 0.09 * sin(dot(in.local, float3(68, 54, 87)));
    if (in.color.w > 3.5)
        grain = 0.97 + 0.03 * sin(in.local.x * 1300); // subtle brushed silver, not a measured texture
    float specular = pow(max(dot(reflect(-light, n), float3(0, 0, 1)), 0.0), 32);
    return float4(in.color.rgb * grain * diffuse + specular * (in.color.w > 2.5 ? 0.6 : 0.12), 1);
}
