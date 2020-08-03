export class CtmMat_Frag extends Laya.BlinnPhongMaterial
{
    public static readonly DiffsColor: number = Laya.Shader3D.propertyNameToID( "u_DiffsColor" );
    public static readonly Texture: number = Laya.Shader3D.propertyNameToID( "u_Texture" );
    public static readonly NoiseTexture: number = Laya.Shader3D.propertyNameToID( "u_NoiseTexture" );
    public static readonly StartTime: number = Laya.Shader3D.propertyNameToID( "u_StartTime" );

    constructor()
    {
        super();
        this.setShaderName( "CtmMat_Frag" );
        this.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_OPAQUE;
    }

    public set DiffsColor( value: Laya.Vector4 )
    {
        this._shaderValues.setVector( CtmMat_Frag.DiffsColor, value );
    }

    public set Texture( value: Laya.BaseTexture )
    {
        this._shaderValues.setTexture( CtmMat_Frag.Texture, value );
    }

    public set NoiseTexture( value: Laya.BaseTexture ) 
    {
        this._shaderValues.setTexture( CtmMat_Frag.NoiseTexture, value );
    }

    public set StartTime( value: number )
    {
        this._shaderValues.setNumber( CtmMat_Frag.StartTime, value );
    }

}

export class CtmSha_Frag
{
    public init(): void
    {
        var attributeMap = {
            "a_Position": Laya.VertexMesh.MESH_POSITION0,
            "a_Normal": Laya.VertexMesh.MESH_NORMAL0,
            'a_Texcoord0': Laya.VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_BoneWeights': Laya.VertexMesh.MESH_BLENDWEIGHT0,
            'a_BoneIndices': Laya.VertexMesh.MESH_BLENDINDICES0
        };
        var uniformMap = {
            'u_Bones': Laya.Shader3D.PERIOD_CUSTOM,
            'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
            'u_Color': Laya.Shader3D.PERIOD_MATERIAL,
            'u_LineWidth': Laya.Shader3D.PERIOD_MATERIAL,
            'u_NoiseTexture': Laya.Shader3D.PERIOD_MATERIAL,
            'u_Time': Laya.Shader3D.PERIOD_SCENE,
            'u_Speed': Laya.Shader3D.PERIOD_MATERIAL,
            'u_MainTex': Laya.Shader3D.PERIOD_MATERIAL,
            'u_Texture': Laya.Shader3D.PERIOD_MATERIAL,
            'u_DissolveState': Laya.Shader3D.PERIOD_MATERIAL,
            'u_StartTime': Laya.Shader3D.PERIOD_MATERIAL,
            'u_DiffsColor': Laya.Shader3D.PERIOD_MATERIAL,
        };
        var stateMap = {
            's_Cull': Laya.Shader3D.RENDER_STATE_CULL,
            's_Blend': Laya.Shader3D.RENDER_STATE_BLEND,
            's_BlendSrc': Laya.Shader3D.RENDER_STATE_BLEND_SRC,
            's_BlendDst': Laya.Shader3D.RENDER_STATE_BLEND_DST,
            's_DepthTest': Laya.Shader3D.RENDER_STATE_DEPTH_TEST,
            's_DepthWrite': Laya.Shader3D.RENDER_STATE_DEPTH_WRITE
        };

        let vs = `
        #include "Lighting.glsl";
        attribute vec4 a_Position;
        attribute vec2 a_Texcoord0;
        attribute vec3 a_Normal;
        uniform mat4 u_MvpMatrix;
        uniform mat4 u_WorldMat;
        varying vec2 v_Texcoord0;
        varying vec3 v_Normal;
        uniform float u_Speed;

        #ifdef BONE
        attribute vec4 a_BoneIndices;
        attribute vec4 a_BoneWeights;
        const int c_MaxBoneCount = 24;
        uniform mat4 u_Bones[c_MaxBoneCount];
        #endif

        void main()
        {
            v_Texcoord0 = a_Texcoord0;
            #ifdef BONE
            mat4 skinTransform=mat4(0.0);
            skinTransform += u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
            skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
            skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
            skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
            vec4 position = skinTransform * a_Position;
            gl_Position=u_MvpMatrix * position;
            mat3 worldMat=mat3(u_WorldMat * skinTransform);
            #else
            gl_Position=u_MvpMatrix * a_Position;
            mat3 worldMat=mat3(u_WorldMat);
            #endif
            v_Normal=worldMat*a_Normal;
            gl_Position=remapGLPositionZ(gl_Position); 
        }
        `;

        let ps = `
        #ifdef FSHIGHPRECISION
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform vec4 u_Color;
        uniform sampler2D u_MainTex;
        varying vec2 v_Texcoord0;
        uniform vec4 u_DiffsColor;
        uniform sampler2D u_Texture;
        uniform sampler2D u_NoiseTexture;
        float edgeWidth = 0.01;
        uniform float u_Time;
        uniform float u_StartTime;
        float DissolveSpeed = 5.0;
        vec4 EdgeColor;
        vec4 lerp(vec4 from,vec4 to, float t )
        {
            t = max(0.0, min(1.0, t));
            vec4 tmp;
            tmp.x = from.x + ( to.x - from.x ) * t;
            tmp.y = from.y + ( to.y - from.y ) * t;
            tmp.z = from.z + ( to.z - from.z ) * t;
            tmp.w = from.w + ( to.w - from.w ) * t;
            return tmp;
        }
        float saturate(float x)
        {
            return max(0.0, min(1.0, x));
        }
        void main()
        {
            float DissolveFactor = saturate((u_Time - u_StartTime) / DissolveSpeed);
            float noiseValue = texture2D(u_NoiseTexture,v_Texcoord0).r;            
            if(noiseValue <= DissolveFactor)
            {
                discard;
            }

            gl_FragColor = texture2D(u_Texture,v_Texcoord0) * u_DiffsColor;
        }
        `;

        var customShader = Laya.Shader3D.add( "CtmMat_Frag" );
        var subShader = new Laya.SubShader( attributeMap, uniformMap, Laya.SkinnedMeshSprite3D.shaderDefines, Laya.BlinnPhongMaterial.shaderDefines );
        customShader.addSubShader( subShader );
        subShader.addShaderPass( vs, ps, stateMap );
    }
}