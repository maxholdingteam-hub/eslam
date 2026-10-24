using UnrealBuildTool;

public class CairoShadowsEditorTarget : TargetRules
{
	public CairoShadowsEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.V5;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("CairoShadows");
	}
}
