#include "ViewPoint.h"
#include "CairoPlayerCharacter.h"
#include "Components/BoxComponent.h"

AViewPoint::AViewPoint()
{
	Zone = CreateDefaultSubobject<UBoxComponent>(TEXT("Zone"));
	RootComponent = Zone;
	Zone->SetBoxExtent(FVector(120.f, 120.f, 100.f));
	Zone->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	Zone->OnComponentBeginOverlap.AddDynamic(this, &AViewPoint::OnEnter);
}

void AViewPoint::OnEnter(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex, bool bFromSweep, const FHitResult& Sweep)
{
	if (ACairoPlayerCharacter* P = Cast<ACairoPlayerCharacter>(Other)) P->EnterViewPoint(this);
}
