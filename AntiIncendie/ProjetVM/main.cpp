#include "ProjetVM.h"
#include <QtWidgets/QApplication>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    ProjetVM w;
    w.show();
    return a.exec();
}
