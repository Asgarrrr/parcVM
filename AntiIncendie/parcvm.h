#pragma once

#include <QtWidgets/QMainWindow>
#include "ui_parcvm.h"

class parcvm : public QMainWindow
{
    Q_OBJECT

public:
    parcvm(QWidget *parent = Q_NULLPTR);

private:
    Ui::parcvmClass ui;
};
