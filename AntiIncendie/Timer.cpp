#include "Timer.h"

Timer::Timer(QObject *parent, Database * db)
	: QObject(parent)
{
	//Créer un nouveau timer de 5s
	timer5sec = new QTimer(this);
	QObject::connect(timer5sec, SIGNAL(timeout()), this, SLOT(onTimeoutSec()));
	timer5sec->start(5000);

	//Créer un nouveau timer de 5m
	timer5min = new QTimer(this);
	QObject::connect(timer5min, SIGNAL(timeout()), this, SLOT(onTimeoutMin()));
	timer5min->start(305000);

	//Se connecte à la BDD et récupère l'instance de la carte E/S puis ouvre une connexion à celle-ci
	this->db = db;
	db->dbConnect();
	carteES = K8055Adapter::getInstance();
	carteES->OpenDevice(0);
}

void Timer::onTimeoutsec()
{
	double numValue = carteES->ReadAnalogChannel(1);

	//Transforme la valeur numérique en tension
	double tensionValue = numValue / 255.0 * 5.0;
	qDebug() << "La tension est de :" << tensionValue << "V";

	//Transforme la tension en température
	double tempValue = (tensionValue * 90 / 5) - 30;
	qDebug() << "La temperature est de :" << tempValue << "°C";
	qDebug() << "";

	db->dbInsert(tempValue, tensionValue);
}

Timer::~Timer()
{
}
