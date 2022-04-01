//---------------------------------------------------------------------------

#ifndef K8055H
#define K8055H
#include "K8055D.h"
//---------------------------------------------------------------------------
#endif
class K8055
{
	int Etat; //Sert a enregister l'etat de la connexion a la carte
	int res; //Enregistre ce que renvoie l'entrée analogique
	public:
		K8055(int addr); //initialise les variables et ouvre la connexion a la carte
		int getEtat();
		int lecture_analog(); //Sert a lire les donnée des entrées analogiques
		~K8055(); //detruit la classe de la carte et coupe les lumiere
};
