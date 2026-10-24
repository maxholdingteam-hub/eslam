#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ViewPoint.generated.h"

class UBoxComponent;

// نقطة المزامنة فوق المئذنة: بتكشف الهدف، ومنها قفزة الإيمان
UCLASS()
class CAIROSHADOWS_API AViewPoint : public AActor
{
	GENERATED_BODY()

public:
	AViewPoint();

	UPROPERTY(VisibleAnywhere, Category = "Cairo") TObjectPtr<UBoxComponent> Zone;

	UPROPERTY(EditInstanceOnly, BlueprintReadOnly, Category = "Cairo", meta = (ToolTip = "عربية القش اللي تحت المئذنة"))
	TObjectPtr<AActor> LeapTarget;

private:
	UFUNCTION() void OnEnter(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex, bool bFromSweep, const FHitResult& Sweep);
};
