#include "HidingSpot.h"
#include "CairoPlayerCharacter.h"
#include "Components/BoxComponent.h"
#include "Components/StaticMeshComponent.h"

AHidingSpot::AHidingSpot()
{
	Zone = CreateDefaultSubobject<UBoxComponent>(TEXT("Zone"));
	RootComponent = Zone;
	Zone->SetBoxExtent(FVector(80.f, 120.f, 80.f));
	Zone->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	Zone->SetGenerateOverlapEvents(true);
	Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
	Mesh->SetupAttachment(Zone);
	Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	Tags.Add(TEXT("HidingSpot"));
	Zone->OnComponentBeginOverlap.AddDynamic(this, &AHidingSpot::OnEnter);
	Zone->OnComponentEndOverlap.AddDynamic(this, &AHidingSpot::OnExit);
}


void AHidingSpot::OnEnter(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex, bool bFromSweep, const FHitResult& Sweep)
{
	if (ACairoPlayerCharacter* P = Cast<ACairoPlayerCharacter>(Other)) P->SetHidingSpot(this);
}

void AHidingSpot::OnExit(UPrimitiveComponent* Comp, AActor* Other, UPrimitiveComponent* OtherComp, int32 BodyIndex)
{
	if (ACairoPlayerCharacter* P = Cast<ACairoPlayerCharacter>(Other)) P->ClearHidingSpot(this);
}
