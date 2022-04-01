#include "parcvm.h"
#include <QtCore/QCoreApplication>
#include "K8055Adapter.h"
#include "Database.h"
#include "Timer.h"
#include <qdebug.h>
#include <qthread.h>

int main(int argc, char *argv[])
{
    QCoreApplication a(argc, argv);

	Database * db = new Database;

	Timer timer(&a, db);

    return a.exec();
}
