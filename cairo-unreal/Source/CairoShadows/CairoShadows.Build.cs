using UnrealBuildTool;

public class CairoShadows : ModuleRules
{
	public CairoShadows(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core", "CoreUObject", "Engine", "InputCore", "EnhancedInput",
			"AIModule", "GameplayTasks", "NavigationSystem", "UMG", "Slate", "SlateCore"
		});
	}
}
