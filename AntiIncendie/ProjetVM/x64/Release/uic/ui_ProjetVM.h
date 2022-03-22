/********************************************************************************
** Form generated from reading UI file 'ProjetVM.ui'
**
** Created by: Qt User Interface Compiler version 5.14.2
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_PROJETVM_H
#define UI_PROJETVM_H

#include <QtCore/QVariant>
#include <QtWidgets/QApplication>
#include <QtWidgets/QLabel>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QMenuBar>
#include <QtWidgets/QStatusBar>
#include <QtWidgets/QToolBar>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_ProjetVMClass
{
public:
    QWidget *centralWidget;
    QLabel *label;
    QLabel *label2;
    QMenuBar *menuBar;
    QToolBar *mainToolBar;
    QStatusBar *statusBar;

    void setupUi(QMainWindow *ProjetVMClass)
    {
        if (ProjetVMClass->objectName().isEmpty())
            ProjetVMClass->setObjectName(QString::fromUtf8("ProjetVMClass"));
        ProjetVMClass->resize(600, 400);
        centralWidget = new QWidget(ProjetVMClass);
        centralWidget->setObjectName(QString::fromUtf8("centralWidget"));
        label = new QLabel(centralWidget);
        label->setObjectName(QString::fromUtf8("label"));
        label->setGeometry(QRect(30, 30, 91, 31));
        label2 = new QLabel(centralWidget);
        label2->setObjectName(QString::fromUtf8("label2"));
        label2->setGeometry(QRect(120, 30, 81, 31));
        ProjetVMClass->setCentralWidget(centralWidget);
        menuBar = new QMenuBar(ProjetVMClass);
        menuBar->setObjectName(QString::fromUtf8("menuBar"));
        menuBar->setGeometry(QRect(0, 0, 600, 21));
        ProjetVMClass->setMenuBar(menuBar);
        mainToolBar = new QToolBar(ProjetVMClass);
        mainToolBar->setObjectName(QString::fromUtf8("mainToolBar"));
        ProjetVMClass->addToolBar(Qt::TopToolBarArea, mainToolBar);
        statusBar = new QStatusBar(ProjetVMClass);
        statusBar->setObjectName(QString::fromUtf8("statusBar"));
        ProjetVMClass->setStatusBar(statusBar);

        retranslateUi(ProjetVMClass);

        QMetaObject::connectSlotsByName(ProjetVMClass);
    } // setupUi

    void retranslateUi(QMainWindow *ProjetVMClass)
    {
        ProjetVMClass->setWindowTitle(QCoreApplication::translate("ProjetVMClass", "ProjetVM", nullptr));
        label->setText(QCoreApplication::translate("ProjetVMClass", "Base de donn\303\251e :", nullptr));
        label2->setText(QString());
    } // retranslateUi

};

namespace Ui {
    class ProjetVMClass: public Ui_ProjetVMClass {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_PROJETVM_H
