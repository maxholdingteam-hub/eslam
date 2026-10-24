#pragma once

#include "CoreMinimal.h"
#include "CairoTypes.generated.h"

UENUM(BlueprintType)
enum class EGuardState : uint8
{
	Patrol,
	Suspicious,
	Alert,
	Search,
	Return,
	Stunned,
	Flee,
	Dead
};

UENUM(BlueprintType)
enum class EPlayerStance : uint8
{
	Normal,
	Climbing,
	Mantling,
	Attacking,
	Dodging,
	Parrying,
	HitReact,
	Cinematic,
	AtViewPoint,
	Dead
};

UENUM(BlueprintType)
enum class EVisibilityStatus : uint8
{
	Anonymous,
	Blended,
	Hidden,
	Suspicious,
	Exposed
};

UENUM(BlueprintType)
enum class EContextAction : uint8
{
	None,
	Assassinate,
	AirAssassinate,
	Finisher,
	LeapOfFaith,
	CarryBody,
	DropBody
};

UENUM(BlueprintType)
enum class EMissionObjective : uint8
{
	FindTarget,
	KillTarget,
	Escape,
	Complete,
	Failed
};
