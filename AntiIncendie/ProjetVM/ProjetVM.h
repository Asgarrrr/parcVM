#pragma once

#include <QtWidgets/QMainWindow>
#include "ui_ProjetVM.h"

#include <QtSql>
#include <QSqlDatabase>
#include <QSqlQuery>


class ProjetVM : public QMainWindow
{
    Q_OBJECT

public:
	QSqlDatabase db;
    ProjetVM(QWidget *parent = Q_NULLPTR);

private slots:


private:
    Ui::ProjetVMClass ui;

};
