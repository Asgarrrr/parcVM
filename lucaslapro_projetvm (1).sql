-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : lun. 04 avr. 2022 à 09:05
-- Version du serveur : 10.3.29-MariaDB-0+deb10u1
-- Version de PHP : 7.3.29-1~deb10u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `lucaslapro_projetvm`
--

-- --------------------------------------------------------

--
-- Structure de la table `Classe`
--

CREATE TABLE `Classe` (
  `IdClasse` int(11) NOT NULL,
  `Nom` varchar(30) NOT NULL,
  `Description` varchar(200) NOT NULL,
  `IdVm` int(11) NOT NULL,
  `UserClasse` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `Projet`
--

CREATE TABLE `Projet` (
  `IdProjet` int(11) NOT NULL,
  `Nom` varchar(30) NOT NULL,
  `Description` varchar(200) NOT NULL,
  `IdVm` int(11) NOT NULL,
  `UsersProjet` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `Sessions`
--

CREATE TABLE `Sessions` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Token` varchar(65) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `Temperature`
--

CREATE TABLE `Temperature` (
  `Id_temp` int(11) NOT NULL,
  `temp` int(11) NOT NULL,
  `timetemp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `Temperature`
--

INSERT INTO `Temperature` (`Id_temp`, `temp`, `timetemp`) VALUES
(1, 24, '2022-03-17 10:22:45');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `IdUser` int(11) NOT NULL,
  `Nom` varchar(30) NOT NULL,
  `Prenom` varchar(30) NOT NULL,
  `Email` varchar(30) NOT NULL,
  `MDP` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`IdUser`, `Nom`, `Prenom`, `Email`, `MDP`) VALUES
(19, 'admin', 'admin', 'Test', '0cbc6611f5540bd0809a388dc95a615b'),
(20, 'phillipe', 'Michel', 'Michel.philippe@gmail.com', 'sdffsdglijhgfhj'),
(21, 'admin', 'admin', 'Test', '0cbc6611f5540bd0809a388dc95a615b'),
(22, 'admin', 'admin', 'Test', '0cbc6611f5540bd0809a388dc95a615b'),
(23, 'admin', 'admin', 'Test', '0cbc6611f5540bd0809a388dc95a615b'),
(24, 'admin', 'admin', 'Test', '0cbc6611f5540bd0809a388dc95a615b'),
(25, 'admin', 'admin', 'Test', '0cbc6611f5540bd0809a388dc95a615b');

-- --------------------------------------------------------

--
-- Structure de la table `Vm`
--

CREATE TABLE `Vm` (
  `IdVm` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `Classe`
--
ALTER TABLE `Classe`
  ADD PRIMARY KEY (`IdClasse`);

--
-- Index pour la table `Projet`
--
ALTER TABLE `Projet`
  ADD PRIMARY KEY (`IdProjet`);

--
-- Index pour la table `Sessions`
--
ALTER TABLE `Sessions`
  ADD PRIMARY KEY (`ID`);

--
-- Index pour la table `Temperature`
--
ALTER TABLE `Temperature`
  ADD PRIMARY KEY (`Id_temp`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`IdUser`);

--
-- Index pour la table `Vm`
--
ALTER TABLE `Vm`
  ADD PRIMARY KEY (`IdVm`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `Classe`
--
ALTER TABLE `Classe`
  MODIFY `IdClasse` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Projet`
--
ALTER TABLE `Projet`
  MODIFY `IdProjet` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Sessions`
--
ALTER TABLE `Sessions`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `Temperature`
--
ALTER TABLE `Temperature`
  MODIFY `Id_temp` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `IdUser` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
