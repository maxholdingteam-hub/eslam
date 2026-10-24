using UnrealBuildTool;

public class CairoShadowsTarget : TargetRules
{
	public CairoShadowsTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.V5;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("CairoShadows");
	}
}
