vec3 diffuse = vec3( 1.0 );

vec3 geometryPosition = mvPosition.xyz;
vec3 geometryNormal = normalize( transformedNormal );
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( -mvPosition.xyz );

vec3 backGeometryNormal = - geometryNormal;

vLightFront = vec3( 0.0 );
vIndirectFront = vec3( 0.0 );
#ifdef DOUBLE_SIDED
    vLightBack = vec3( 0.0 );
    vIndirectBack = vec3( 0.0 );
#endif

IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;

vIndirectFront += getAmbientLightIrradiance( ambientLightColor );

#if defined( USE_LIGHT_PROBES )

    vIndirectFront += getLightProbeIrradiance( lightProbe, geometryNormal );

#endif

#ifdef DOUBLE_SIDED

    vIndirectBack += getAmbientLightIrradiance( ambientLightColor );

    #if defined( USE_LIGHT_PROBES )

        vIndirectBack += getLightProbeIrradiance( lightProbe, backGeometryNormal );

    #endif

#endif

#if NUM_POINT_LIGHTS > 0

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

        getPointLightInfo( pointLights[ i ], geometryPosition, directLight );

        dotNL = dot( geometryNormal, directLight.direction );
        directLightColor_Diffuse = directLight.color;

        vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

        #ifdef DOUBLE_SIDED

            vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;

        #endif

    }
    #pragma unroll_loop_end

#endif

#if NUM_SPOT_LIGHTS > 0

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

        getSpotLightInfo( spotLights[ i ], geometryPosition, directLight );

        dotNL = dot( geometryNormal, directLight.direction );
        directLightColor_Diffuse = directLight.color;

        vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

        #ifdef DOUBLE_SIDED

            vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;

        #endif
    }
    #pragma unroll_loop_end

#endif

#if NUM_DIR_LIGHTS > 0

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

        getDirectionalLightInfo( directionalLights[ i ], directLight );

        dotNL = dot( geometryNormal, directLight.direction );
        directLightColor_Diffuse = directLight.color;

        vLightFront += saturate( dotNL ) * directLightColor_Diffuse;

        #ifdef DOUBLE_SIDED

            vLightBack += saturate( - dotNL ) * directLightColor_Diffuse;

        #endif

    }
    #pragma unroll_loop_end

#endif

#if NUM_HEMI_LIGHTS > 0

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

        vIndirectFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );

        #ifdef DOUBLE_SIDED

            vIndirectBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometryNormal );

        #endif

    }
    #pragma unroll_loop_end

#endif

#include <shadowmap_vertex>
#include <fog_vertex>