-- MySQL dump 10.13  Distrib 8.0.35, for Linux (x86_64)
--
-- Host: localhost    Database: laravel
-- ------------------------------------------------------
-- Server version	8.0.35-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `emails`
--

DROP TABLE IF EXISTS `emails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emails` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `destinatarios` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `corpo_email` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT '2023-07-19 00:54:46',
  `data_envio` timestamp NULL DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emails`
--

LOCK TABLES `emails` WRITE;
/*!40000 ALTER TABLE `emails` DISABLE KEYS */;
INSERT INTO `emails` VALUES (1,'brunnohoffmann89@gmail.com','Serviço','<b>Isso é so um teste<b>','2023-07-19 00:54:46','2023-07-19 06:45:44',1,NULL,'2023-07-19 06:45:44');
/*!40000 ALTER TABLE `emails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `route_view_id` bigint unsigned DEFAULT NULL,
  `text` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iconcolor` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `header` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nome da header, usar so para menus q abrem, ira adicionar uma label header a cima',
  `label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `label_color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `label_date_active` datetime DEFAULT NULL COMMENT 'Apare ate essa data',
  PRIMARY KEY (`id`),
  UNIQUE KEY `menus_parent_id_order_unique` (`parent_id`,`order`),
  KEY `menus_route_view_id_foreign` (`route_view_id`)
) ENGINE=MyISAM AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,NULL,NULL,'CADASTRO','fas fa-fw fa-lock','','1.1',1,NULL,NULL,'ADMIN',NULL,NULL,NULL),(2,1,3,'usuario','fas fa-fw fa-user-edit','yellow','1.1.1',1,NULL,NULL,NULL,'Novo','danger','2023-07-12 00:00:00'),(3,1,4,'rotas','fas fa-fw fa-route','yellow','1.1.2',1,NULL,NULL,NULL,NULL,NULL,NULL),(5,NULL,NULL,'DASHBOARD','fas fa-chart-area','','5.1',1,NULL,NULL,'ACOMPANHAMENTO',NULL,NULL,NULL),(7,22,9,'relatorio1',NULL,'cyan','5.6.1',1,NULL,NULL,NULL,NULL,NULL,NULL),(12,NULL,NULL,'RELATÓRIOS','fas fa-file-excel','','5.2',1,NULL,NULL,'ACOMPANHAMENTO',NULL,NULL,NULL),(13,5,1,'dash',NULL,'cyan','5.1.1',1,NULL,NULL,NULL,NULL,NULL,NULL),(14,12,12,'relatorio2',NULL,'purple','5.2.2',1,NULL,NULL,NULL,NULL,NULL,NULL),(15,5,13,'dash_modelo',NULL,'purple','5.1.9',1,NULL,NULL,NULL,NULL,NULL,NULL),(16,21,14,'grafico documentos',NULL,'cyan','5.5.2',1,NULL,NULL,NULL,NULL,NULL,NULL),(17,NULL,NULL,'GRAFICOS','fas fa-chart-pie','','5.3',1,NULL,NULL,'ACOMPANHAMENTO',NULL,NULL,NULL),(18,NULL,NULL,'FINANCEIRO','fas fa-store-alt','','5.4',1,NULL,NULL,'SETORES',NULL,NULL,NULL),(19,18,15,'relatorio financeiro1',NULL,'cyan','5.4.1',1,NULL,NULL,NULL,NULL,NULL,NULL),(20,21,16,'produtos_codigo_cliente',NULL,'cyan','5.5.1',1,NULL,NULL,NULL,NULL,NULL,NULL),(21,NULL,NULL,'FATURAMENTO','fas fa-store-alt','','5.5',1,NULL,NULL,'SETORES',NULL,NULL,NULL),(22,NULL,NULL,'ESTOQUE','fas fa-store-alt','','5.6',1,NULL,NULL,'SETORES',NULL,NULL,NULL),(23,5,17,'dash_producao',NULL,'cyan','5.1.2',1,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2023_07_04_0000_create_permissions_table',1),(2,'2023_07_04_0001_create_roles_table',1),(3,'2023_07_04_0003_create_role_permission_table',1),(4,'2023_07_04_0004_create_users_table',1),(5,'2023_07_04_0005_create_password_resets_table',1),(6,'2023_07_04_0006_create_failed_jobs_table',1),(7,'2023_07_05_0007_create_routes_table',2),(8,'2023_07_05_0008_create_role_route_table',3),(9,'2023_07_05_0009_create_route_role_table',4),(10,'2023_07_05_163751_create_route_views_table',5),(11,'2023_07_05_163801_create_role_route_view_table',5),(12,'2023_07_06_154145_create_failed_jobs_table',0),(13,'2023_07_06_154145_create_password_resets_table',0),(14,'2023_07_06_154145_create_permissions_table',0),(15,'2023_07_06_154145_create_role_permission_table',0),(16,'2023_07_06_154145_create_role_route_view_table',0),(17,'2023_07_06_154145_create_roles_table',0),(18,'2023_07_06_154145_create_route_views_table',0),(19,'2023_07_06_154145_create_users_table',0),(20,'2023_07_06_183104_create_menus_table',6),(21,'2023_07_08_032435_create_failed_jobs_table',0),(22,'2023_07_08_032435_create_menus_table',0),(23,'2023_07_08_032435_create_password_resets_table',0),(24,'2023_07_08_032435_create_permissions_table',0),(25,'2023_07_08_032435_create_role_permission_table',0),(26,'2023_07_08_032435_create_role_route_view_table',0),(27,'2023_07_08_032435_create_roles_table',0),(28,'2023_07_08_032435_create_route_views_table',0),(29,'2023_07_08_032435_create_users_table',0),(31,'2023_07_14_010857_add_session_id_to_users_table',7),(32,'2023_07_14_023541_add_allowed_ip_to_users_table',8),(33,'2023_07_18_215159_create_emails_table',9);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Permission',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_unique` (`name`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'create','Permission',NULL,NULL),(2,'read','Permission',NULL,NULL),(3,'update','Permission',NULL,NULL),(4,'delete','Permission',NULL,NULL);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_permission_role_id_foreign` (`role_id`),
  KEY `role_permission_permission_id_foreign` (`permission_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
INSERT INTO `role_permission` VALUES (1,1,1,NULL,NULL),(2,1,2,NULL,NULL),(3,1,3,NULL,NULL),(4,1,4,NULL,NULL),(5,2,1,NULL,NULL),(6,2,2,NULL,NULL),(7,2,3,NULL,NULL),(8,3,2,NULL,NULL);
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_route_view`
--

DROP TABLE IF EXISTS `role_route_view`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_route_view` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned NOT NULL,
  `route_view_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_route_view_role_id_foreign` (`role_id`),
  KEY `role_route_view_route_view_id_foreign` (`route_view_id`)
) ENGINE=MyISAM AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_route_view`
--

LOCK TABLES `role_route_view` WRITE;
/*!40000 ALTER TABLE `role_route_view` DISABLE KEYS */;
INSERT INTO `role_route_view` VALUES (159,1,4,NULL,NULL),(158,1,3,NULL,NULL),(165,2,16,NULL,NULL),(157,1,2,NULL,NULL),(156,1,9,NULL,NULL),(164,2,14,NULL,NULL),(155,1,1,NULL,NULL),(154,1,12,NULL,NULL),(153,1,14,NULL,NULL),(98,3,9,NULL,NULL),(97,3,13,NULL,NULL),(152,1,16,NULL,NULL),(163,2,1,NULL,NULL),(151,1,13,NULL,NULL),(162,2,15,NULL,NULL),(150,1,17,NULL,NULL),(161,2,17,NULL,NULL),(160,1,15,NULL,NULL),(166,2,9,NULL,NULL);
/*!40000 ALTER TABLE `role_route_view` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Permission',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Permission',NULL,NULL),(2,'editor','Permission',NULL,NULL),(3,'user','Permission',NULL,NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_views`
--

DROP TABLE IF EXISTS `route_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_views` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `route_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `route_views_un` (`route_name`),
  UNIQUE KEY `route_views_un2` (`url`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_views`
--

LOCK TABLES `route_views` WRITE;
/*!40000 ALTER TABLE `route_views` DISABLE KEYS */;
INSERT INTO `route_views` VALUES (1,'Dashboard - Gerencial','dashboard','view.dashboard',NULL,NULL),(2,'Relatório Exemplo','relatorio_exemplo','view.relatorio_exemplo',NULL,NULL),(3,'Cadastro Usuário','cadastro_usuario','view.usuario_cadastro',NULL,NULL),(4,'Cadastro Rotas','cadastro_acessos','view.acessos_cadastro',NULL,NULL),(9,'Relatório Patrimonio','relatorio_patrimonio','view.relatorio_patrimonio',NULL,NULL),(12,'Exemplos de Componentes','relatorio_componentes_exemplo','view.componentes_exemplos','2023-07-18 04:17:37','2023-07-18 04:17:37'),(13,'Dashboard Modelos','dashboard_modelos','view.dashboard_modelos','2023-07-19 02:58:16','2023-07-19 03:10:41'),(14,'Documentos Expedidos','grafico_documentos_sunburst','view.grafico_documentos_sunburst','2023-08-02 18:10:25','2023-08-02 18:10:25'),(15,'Pedidos Gerencial','relatorio_financeiro_pedidos','view.relatorio_financeiro_pedidos','2023-08-16 01:51:54','2023-08-16 01:51:54'),(16,'Produto Código Cliente','relatorio_produtos_codigo_cliente','view.relatorio_produtos_codigo_cliente','2023-11-07 16:18:52','2023-11-07 16:28:29'),(17,'Dashboard Produção','dashboard_producao','view.dashboard_producao','2024-01-13 20:53:17','2024-01-13 20:53:17');
/*!40000 ALTER TABLE `route_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint unsigned DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `active` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'B' COMMENT '''S/N/B''',
  `allowed_ip` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '*',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id_foreign` (`role_id`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Sistemas','sistema@sistema.com',NULL,'$2y$10$g9xkSqQ7fv4Opm4KAtrQa.5XoGlDLG1BIAhxBlZ7COqcadlQVZqZa','I1KjLgCPPO87BHNjk3ozc5muCAT1ipNhzBnNbLqP','FSRswLVMOiMqrl8b7Rqu7Y8TKqYdtYaKO24vD79egbcsOlj6aIk5K83Qco71',NULL,'2024-01-19 15:16:06','S','*'),(6,1,'Roger Vinicius Sobrinho','roger.sobrinho@sistema.com',NULL,'$2y$10$5iiBn2j4CL7B0ekoAmprmejqheNcTOjzAj4VUauSRInbfRmI5mMXG','vGiK054qxLRoARfksv7rh8VRFF81tc91ZIHrc5Mv','vRfQWco8QwQpfGfL7RDZMM10tF0zlLBdpDoYOhVtYeYwTngOoANFBFqDbatj','2023-07-09 07:54:16','2024-01-19 16:04:12','S','*'),(7,2,'Henrique JallCard','henrique@jallcard.com.br',NULL,'$2y$10$BO3lZGCtJBXPfiIxDHoyfOoVzjsV.H0i8UWbZKfWBDwYPriR1fTOS','XBvdanA3zHyGaAoOqo44Ll4bZhIa9IIafNI64CJL',NULL,'2023-08-16 16:17:46','2024-01-10 20:44:10','S','*'),(8,2,'Marcio Castro Shubiner','marcio@jallcard.com.br',NULL,'$2y$10$dGCuZfGWxZB5EJidYyUNju125/vrc9iY.qu7lFjhoQEt1b7zxxdMm','TRbMqdFoCyaCqguRq65ZMMElzL2a709gx0e6sM07','KYudqqqVNAKWMaqlyG4Ypyogjjn8uKWKrUHsp6Rs6Lnv5vnVaJ9npjNeeGMq','2023-09-06 15:39:16','2024-01-18 23:17:46','S','*'),(9,2,'Cleber','cleber@jallcard.com.br',NULL,'$2y$10$1UDoQbtiAld9vOcov50vEOpOa1hmmGi55idy4tTXqkeRL6w3uJLMi','4HIjbJrqMdzfZcxi5ZCvGF1mqi45iUmP5cXPkXru','zne9wmuCKmv18AErpmsQY69uGRUKSvLLRi9yJXSbUyfmmMQEse3wmalhEBzA','2023-09-12 15:49:23','2024-01-19 15:59:59','S','*'),(10,2,'Andrez','andrez_v@flashcourier.com.br',NULL,'$2y$10$MaG0Ghe7NQDAF9KBzh9oJ.B/GEAbgeG2WT/txN8kgJ3PjQwslfk.S',NULL,NULL,'2023-10-17 00:05:13','2023-10-17 00:05:48','S','*'),(11,2,'Eduardo Veiga','Eduardo.veiga@jallcard.com.br',NULL,'$2y$10$z7JYKlaCJpDJp.RE6dtANOXptPuaJVRqjqmlqzT9CSzMEPha.i1Oi','gIDAMth9CfHGwMqKvq35iGmX6epAltRWfOg2l2ta','OJeyZycHkz7YEjI2W2JFDgGROMWVdet392Dyc78vHrYAB3tovxqst52qbGZt','2023-11-08 15:40:50','2023-11-08 17:19:42','S','*'),(12,2,'Juliana Rozendo Vaz','juliana.vaz@move3.com.br',NULL,'$2y$10$AUB63uLYzUi5uy4XsFL2XuWuhyRxO.hKRhBLL6flaZl3.FXYSbMcS','MVAIrG3QbOCRpLI6nO18RplnoOppGSVlOjA7EcJk','PxfqLeDW3a8bz6VpGXUcSzDhhzV1iPx1mdwwISQAzWTCqd6w8ESqPOqwtM3C','2023-12-08 21:30:29','2023-12-27 18:21:13','S','*'),(13,2,'Talita da Costa Silva','talita.costa@move3.com.br',NULL,'$2y$10$01ZeAhjUo04jI7WHXckHKO1Nj35PHSSrh26QiLd5on1cEWSi/BQcC','2dvXpFUtfdKUWhPgHzCuAf0R8rhbkMzR6PeNeyIo','vNrrlEpfdHkhBAKqfWSFuGg72LWFn7VtYTK4SjvmtvwVUrNWQEhwpSADjl95','2023-12-08 21:31:05','2023-12-11 20:48:20','S','*'),(14,2,'Andrez Velasco','andrez_v@move3.com.br',NULL,'$2y$10$zWFpfdgIHzFCOwNhwRYZmeI72mlns36.MjAx4cNA6lEJ33uqkymza',NULL,NULL,'2023-12-08 21:31:59','2023-12-08 21:33:05','S','*'),(15,2,'Guilherme Juliani','guilherme@move3.com.br',NULL,'$2y$10$yEgxGfYBWGkozN50uZF7qeilebpahut0uwyfhDl2SGgaRRTAPX3Qi',NULL,NULL,'2023-12-08 21:32:28','2023-12-08 21:33:09','S','*'),(17,2,'Cristina Lopes de Oliveira','cristina@jallcard.com.br',NULL,'$2y$10$BbeuXJFRTpfJ/Ec50qR8sugjOe/YUQCKYPeGZq1ppP8fPngUcdd1G','5hcMA7MRwOSYVUaj4vwOj6f1n0vxiWaVUltneUxo','XrCPTKQbSWK2RlskuXj3NEVUrH3yxdtRIIqvFUdRiSbq3frDmmhYWKdWLRmq','2024-01-10 16:35:02','2024-01-10 23:46:31','S','*'),(18,2,'Valéria Vicilli Souza Silva','valeria.vicilli@jallcard.com.br',NULL,'$2y$10$FOzk/qTAryXP2mQdpgroQOeUTX9lU.ecUy/uaJ17I/GVbe4I0wHkS',NULL,NULL,'2024-01-10 16:35:42','2024-01-10 16:36:23','S','*'),(19,2,'Paula Carolline Silva Ginato','paula.ginato@jallcard.com',NULL,'$2y$10$.fVpC/QzIRaSuiwTZZFBx.CSKw16KyUm.MNoob9kPZ3kU01MfmfGC','FIhubBJK0Rzez9JymBUQyiogvHLMzfJvop4s3UKA',NULL,'2024-01-17 22:36:41','2024-01-18 17:55:45','S','*');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-01-19 11:47:09
