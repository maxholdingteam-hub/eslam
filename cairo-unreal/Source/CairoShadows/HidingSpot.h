#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HidingSpot.generated.h"

class UBoxComponent;
class UStaticMeshComponent;

// عربية قش أو كومة قماش: تستخبى فيها، وتنزل فيها بقفزة الإيمان من غير ما تتعور
UCLASS()
class CAIROSHADOWS_API AHidingSpot : public AActor
{
	GENERATED_BODY()

public:
	AHidingSpot();

	UPROPERTY(VisibleAnywhere, Category = "Cairo") TObjectPtr<UBoxComponent> Zone;
	UPROPERTY(VisibleAnywhere, Category = "Cairo") TObjectPtr<UStaticMeshComponent> Mesh;

private:
	UFUNCTION() void OnEnter(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex, bool bFromSweep, const FHitResult& Sweep);
	UFUNCTION() void OnExit(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex);
};
