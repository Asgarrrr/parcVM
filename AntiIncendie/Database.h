#pragma once

#include <QObject>
#include <QtSql/QtSql>
#include <QSqlDatabase.h>
#include <QDebug>

class Database : public QObject
{
	Q_OBJECT

private:
	QSqlDatabase * db;

public:
	Database(QObject *parent = Q_NULLPTR);
	~Database();

	void dbConnect();
	void dbInsert(double temperature, double tension);
};
