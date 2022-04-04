#include "Database.h"

Database::Database(QObject *parent)
	: QObject(parent)
{
}

Database::~Database()
{
}

//Connexion BDD
void Database::dbConnect()
{
	QSqlDatabase db = QSqlDatabase::addDatabase("QMYSQL");
	db.setHostName("192.168.65.201");
	db.setDatabaseName("lucaslapro_projetvm");
	db.setUserName("admin");
	db.setPassword("admin");

	if (db.open()) {
		qDebug() << "Connexion BDD reussie";
	}
	else {
		qDebug() << "Erreur connexion BDD";
		exit(1);
	}
}
//Insertion BDD de la temperature et la tension
void Database::dbInsert(double temperature, double tension)
{
	QSqlQuery request;
	request.prepare("INSERT INTO `temperature`(`temperature`, `tension`) VALUES(?, ?)");
	request.addBindValue(temperature);
	request.addBindValue(tension);

	request.exec();
}
