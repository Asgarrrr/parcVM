#include "K8055Adapter.h"

K8055Adapter * K8055Adapter::instance = nullptr;

K8055Adapter::K8055Adapter(QObject *parent)
	: QObject(parent)
{
	foundDLL = 0;
	h = init();
	if (!h)
	{
		foundDLL = 1;
	}
	else
	{
		throw K8055AdapterDllNotFoundException;
	}
}

K8055Adapter::~K8055Adapter()
{
	FreeLibrary(hDLL);
}


K8055Adapter * K8055Adapter::getInstance()
{
	if (instance == nullptr)
	{
		instance = new K8055Adapter(Q_NULLPTR);
	}

	return instance;
}

void K8055Adapter::freeInstance()
{
	if (instance != nullptr)
	{
		delete instance;
		instance = nullptr;
	}
}

int K8055Adapter::init()
{
	hDLL = LoadLibrary(L"k8055d");
	if (hDLL != NULL)
	{
		OpenDevice = (t_func4)GetProcAddress(hDLL, "OpenDevice");
		if (!OpenDevice)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		CloseDevice = (t_func0)GetProcAddress(hDLL, "CloseDevice");
		if (!CloseDevice)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		ReadAnalogChannel = (t_func4)GetProcAddress(hDLL, "ReadAnalogChannel");
		if (!ReadAnalogChannel)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		ReadAllAnalog = (t_func2)GetProcAddress(hDLL, "ReadAllAnalog");
		if (!ReadAllAnalog)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		OutputAnalogChannel = (t_func3)GetProcAddress(hDLL, "OutputAnalogChannel");
		if (!OutputAnalogChannel)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		OutputAllAnalog = (t_func3)GetProcAddress(hDLL, "OutputAllAnalog");
		if (!OutputAllAnalog)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		ClearAnalogChannel = (t_func)GetProcAddress(hDLL, "ClearAnalogChannel");
		if (!ClearAnalogChannel)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		ClearAllAnalog = (t_func0)GetProcAddress(hDLL, "ClearAllAnalog");
		if (!ClearAllAnalog)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		SetAnalogChannel = (t_func)GetProcAddress(hDLL, "SetAnalogChannel");
		if (!SetAnalogChannel)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		SetAllAnalog = (t_func0)GetProcAddress(hDLL, "SetAllAnalog");
		if (!SetAllAnalog)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		WriteAllDigital = (t_func)GetProcAddress(hDLL, "WriteAllDigital");
		if (!WriteAllDigital)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		ClearDigitalChannel = (t_func)GetProcAddress(hDLL, "ClearDigitalChannel");
		if (!ClearDigitalChannel)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		ClearAllDigital = (t_func0)GetProcAddress(hDLL, "ClearAllDigital");
		if (!ClearAllDigital)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		SetDigitalChannel = (t_func)GetProcAddress(hDLL, "SetDigitalChannel");
		if (!SetDigitalChannel)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		SetAllDigital = (t_func0)GetProcAddress(hDLL, "SetAllDigital");
		if (!SetAllDigital)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		ReadDigitalChannel = (t_func5)GetProcAddress(hDLL, "ReadDigitalChannel");
		if (!ReadDigitalChannel)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		ReadAllDigital = (t_func1)GetProcAddress(hDLL, "ReadAllDigital");
		if (!ReadAllDigital)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}
		/*Version_ = (t_func0)GetProcAddress(hDLL, "Version");
		if (!Version_)
		{						// handle the error
			FreeLibrary(hDLL);
			return -2;
		}*/
		return 0;				// ok
	}
	return -1;					// error load DLL
}