import { ui } from "./../ui/layaMaxUI";
import { CtmMat_Frag, CtmSha_Frag } from "./CtmMat_Frag";
/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
export default class GameUI extends ui.test.TestSceneUI
{
    private _cmt: CtmMat_Frag;

    private _startTime: number;
    private _scenes: Laya.Scene3D;

    constructor()
    {
        super();

        this._startTime = Date.now();

        new CtmSha_Frag().init();

        var pointLight = new Laya.PointLight() as Laya.PointLight;
        pointLight.range = 500.0;
        pointLight.intensity = 2;
        pointLight.color = new Laya.Vector3( 35 / 255, 40 / 255, 200 / 255 );

        let bodyCtm: CtmMat_Frag = new CtmMat_Frag();
        this._cmt = bodyCtm;
        Laya.Scene3D.load( "res/threeDimen/scene/PBRScene/Demo.ls", Laya.Handler.create( this, function ( scene: Laya.Scene3D ): void
        {
            Laya.stage.addChildAt( scene, 0 );
            scene.addChild( pointLight );
            this._scenes = scene;

            let parent: Laya.Sprite3D = scene.getChildAt( 3 ) as any;
            console.log( parent );
            let wepon: Laya.MeshSprite3D = parent.getChildAt( 1 ).getChildAt( 0 ) as Laya.MeshSprite3D;
            Laya.Texture2D.load( "res/threeDimen/scene/PBRScene/Assets/King Axe/Textures/KingAxe(Bloody)_Albedo.png", Laya.Handler.create( this, ( tex ) =>
            {
                bodyCtm.Texture = tex;
            } ) );
            Laya.Texture2D.load( "res/nor.jpg", Laya.Handler.create( this, ( tex ) =>
            {
                bodyCtm.NoiseTexture = tex;
            } ) );
            bodyCtm.DiffsColor = new Laya.Vector4( 1, 1, 1, 1 );
            bodyCtm.StartTime = this._scenes[ "_time" ] + Number.MAX_VALUE;
            wepon.meshRenderer.material = bodyCtm;
        } ) );

        this.colorPicker.changeHandler = Laya.Handler.create( this, () =>
        {
            this.onChangeColor( this.colorPicker );
        }, null, false );

        this.disBt.on( Laya.Event.CLICK, this, () =>
        {
            bodyCtm.StartTime = this._scenes[ "_time" ] + 0.3;
        } );

        this.recoveBT.on( Laya.Event.CLICK, this, () =>
        {
            bodyCtm.StartTime = this._scenes[ "_time" ] + Number.MAX_VALUE;
        } );
    }

    private onChangeColor( colorPicker: Laya.ColorPicker ): void
    {
        let arr = this.colorString2RGB( colorPicker.selectedColor ).split( "," );
        this._cmt.DiffsColor = new Laya.Vector4( Number( arr[ 0 ] ) / 255, Number( arr[ 1 ] ) / 255, Number( arr[ 2 ] ) / 255, 1 );
    }

    public colorString2RGB( value: string ): string
    {
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        var sColor = value.toLowerCase();
        if ( sColor && reg.test( sColor ) )
        {
            if ( sColor.length === 4 )
            {
                var sColorNew = "#";
                for ( var i = 1; i < 4; i += 1 )
                {
                    sColorNew += sColor.slice( i, i + 1 ).concat( sColor.slice( i, i + 1 ) );
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for ( var i = 1; i < 7; i += 2 )
            {
                sColorChange.push( parseInt( "0x" + sColor.slice( i, i + 2 ) ) );
            }
            return sColorChange.join( "," );
        }
        else
        {
            return sColor;
        }
    }
}