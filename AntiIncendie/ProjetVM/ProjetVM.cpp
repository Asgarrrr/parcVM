#include "ProjetVM.h"

ProjetVM::ProjetVM(QWidget *parent)
    : QMainWindow(parent)
{
    ui.setupUi(this);

	db = QSqlDatabase::addDatabase("QMYSQL");
	db.setHostName("mysql-lucaslapro.alwaysdata.net");
	db.setDatabaseName("lucaslapro_projetvm");
	db.setUserName("229070_rom1");
	db.setPassword("vmrom1-796");
	bool ok = db.open();

	if (db.open())
	{
		ui.label2->setText( "Connected" );
	}
	else
	{
		ui.label2->setText( "Not connected" );
	}
}

