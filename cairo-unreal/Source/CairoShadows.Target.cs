using UnrealBuildTool;

public class CairoShadowsTarget : TargetRules
{
	public CairoShadowsTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.Latest;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("CairoShadows");
	}
}
