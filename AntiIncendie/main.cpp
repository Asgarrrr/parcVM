#include "K8055Adapter.h"

int main(int argc, char ** argv)
{
	K8055Adapter * carteES = K8055Adapter::getInstance();

	int value = carteES->OpenDevice(0);
	std::cout << "Result open : " << value << std::endl;
	
	// Opérations sur la carte (lectures / écritures)
	int numericValue = carteES->ReadAnalogChannel(1);

	std::cout << numericValue << std::endl;
	float percentValue = (float)numericValue / 255.0;
	float temperature = percentValue * 90 - 30;

	std::cout << "Temperature : " << temperature << std::endl;

	carteES->CloseDevice();
	K8055Adapter::freeInstance();

	return 0;
}