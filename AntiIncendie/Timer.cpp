#include "Timer.h"

Timer::Timer(QObject *parent, Database * db)
	: QObject(parent)
{
	//Cr�er un nouveau timer de 5s
	timer5sec = new QTimer(this);
	QObject::connect(timer5sec, SIGNAL(timeout()), this, SLOT(onTimeoutSec()));
	timer5sec->start(5000);

	//Cr�er un nouveau timer de 5m
	timer5min = new QTimer(this);
	QObject::connect(timer5min, SIGNAL(timeout()), this, SLOT(onTimeoutMin()));
	timer5min->start(305000);

	//Se connecte � la BDD et r�cup�re l'instance de la carte E/S puis ouvre une connexion � celle-ci
	this->db = db;
	db->dbConnect();
	carteES = K8055Adapter::getInstance();
	carteES->OpenDevice(0);
}

void Timer::onTimeoutsec()
{
	double numValue = carteES->ReadAnalogChannel(1);

	//Transforme la valeur num�rique en tension
	double tensionValue = numValue / 255.0 * 5.0;
	qDebug() << "La tension est de :" << tensionValue << "V";

	//Transforme la tension en temp�rature
	double tempValue = (tensionValue * 90 / 5) - 30;
	qDebug() << "La temperature est de :" << tempValue << "�C";
	qDebug() << "";

	db->dbInsert(tempValue, tensionValue);
}

Timer::~Timer()
{
}
