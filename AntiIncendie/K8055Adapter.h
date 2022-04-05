#pragma once

#include <QObject>
#include <cstdlib>
#include <windows.h>
#include <iostream>

typedef void(CALLBACK* t_func)(int);
typedef void(CALLBACK* t_func0)();
typedef int(CALLBACK* t_func1)();
typedef void(CALLBACK* t_func2)(int *, int *);
typedef void(CALLBACK* t_func3)(int, int);
typedef int(CALLBACK* t_func4)(int);
typedef bool(CALLBACK* t_func5)(int);

enum
{
	K8055AdapterDllNotFoundException
};


class K8055Adapter : public QObject
{
	Q_OBJECT

private:
	int foundDLL;
	HINSTANCE hDLL;

	int CardAddress;
	int h;

	static K8055Adapter * instance;
	int init();

public:
	K8055Adapter(QObject *parent);
	~K8055Adapter();

	static K8055Adapter * getInstance();
	static void freeInstance();

	t_func4 OpenDevice;
	t_func0 CloseDevice;
	t_func0 Version_;
	t_func4 ReadAnalogChannel;
	t_func2 ReadAllAnalog;
	t_func3 OutputAnalogChannel;
	t_func3 OutputAllAnalog;
	t_func ClearAnalogChannel;
	t_func0 ClearAllAnalog;
	t_func SetAnalogChannel;
	t_func0 SetAllAnalog;
	t_func WriteAllDigital;
	t_func ClearDigitalChannel;
	t_func0 ClearAllDigital;
	t_func SetDigitalChannel;
	t_func0 SetAllDigital;
	t_func5 ReadDigitalChannel;
	t_func1 ReadAllDigital;
};