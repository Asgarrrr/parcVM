#pragma once

#include <QObject>
#include <QTimer>
#include <windows.h>
#include <qdebug.h>
#include "K8055Adapter.h"
#include "Database.h"

class Timer : public QObject
{
	Q_OBJECT

private:
	Database * db;
	K8055Adapter * carteES;
public:
	Timer(QObject *parent, Database * db);
	~Timer();
	QTimer * timer5sec;
	QTimer * timer5min;

public slots:
	void onTimeoutsec();
};

