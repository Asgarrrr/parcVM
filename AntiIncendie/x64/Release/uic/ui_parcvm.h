/********************************************************************************
** Form generated from reading UI file 'parcvm.ui'
**
** Created by: Qt User Interface Compiler version 5.14.2
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_PARCVM_H
#define UI_PARCVM_H

#include <QtCore/QVariant>
#include <QtWidgets/QApplication>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QMenuBar>
#include <QtWidgets/QStatusBar>
#include <QtWidgets/QToolBar>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_parcvmClass
{
public:
    QMenuBar *menuBar;
    QToolBar *mainToolBar;
    QWidget *centralWidget;
    QStatusBar *statusBar;

    void setupUi(QMainWindow *parcvmClass)
    {
        if (parcvmClass->objectName().isEmpty())
            parcvmClass->setObjectName(QString::fromUtf8("parcvmClass"));
        parcvmClass->resize(600, 400);
        menuBar = new QMenuBar(parcvmClass);
        menuBar->setObjectName(QString::fromUtf8("menuBar"));
        parcvmClass->setMenuBar(menuBar);
        mainToolBar = new QToolBar(parcvmClass);
        mainToolBar->setObjectName(QString::fromUtf8("mainToolBar"));
        parcvmClass->addToolBar(mainToolBar);
        centralWidget = new QWidget(parcvmClass);
        centralWidget->setObjectName(QString::fromUtf8("centralWidget"));
        parcvmClass->setCentralWidget(centralWidget);
        statusBar = new QStatusBar(parcvmClass);
        statusBar->setObjectName(QString::fromUtf8("statusBar"));
        parcvmClass->setStatusBar(statusBar);

        retranslateUi(parcvmClass);

        QMetaObject::connectSlotsByName(parcvmClass);
    } // setupUi

    void retranslateUi(QMainWindow *parcvmClass)
    {
        parcvmClass->setWindowTitle(QCoreApplication::translate("parcvmClass", "parcvm", nullptr));
    } // retranslateUi

};

namespace Ui {
    class parcvmClass: public Ui_parcvmClass {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_PARCVM_H
