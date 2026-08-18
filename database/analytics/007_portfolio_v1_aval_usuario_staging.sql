/*
Portfolio Control Center - ETAPA 6 / Avance 3
Staging de usuarios SISGES para jerarquía Supervisor -> Asesor
Motor: SQL Server

EJECUTAR EN:
172.23.1.180\MSSQLSERVER,51601
Base: aval_analytics

La fuente física real se extrae desde:
192.168.100.45\MSSQLSERVER,51601
Base: aval_cob

Analytics NO consulta aval_cob directamente.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO


IF SCHEMA_ID('staging') IS NULL
    EXEC('CREATE SCHEMA staging');
GO


IF OBJECT_ID('staging.aval_usuario_current', 'U') IS NULL
BEGIN
    CREATE TABLE staging.aval_usuario_current
    (
        source_code          VARCHAR(50) NOT NULL,
        source_as_of_at      DATETIME2(3) NOT NULL,

        nId_Usuario          INT NOT NULL,
        cUsr_NroDoc          VARCHAR(30) NULL,
        cUsr_ApePat          VARCHAR(100) NULL,
        cUsr_ApeMat          VARCHAR(100) NULL,
        cUsr_Nombres         VARCHAR(100) NULL,
        bEstado              BIT NOT NULL,
        nid_perfil           INT NULL,
        nid_UsuSuper         INT NULL,

        loaded_at            DATETIME2(3) NOT NULL
            CONSTRAINT DF_staging_aval_usuario_loaded_at
            DEFAULT (SYSUTCDATETIME()),

        CONSTRAINT PK_staging_aval_usuario_current
            PRIMARY KEY (source_code, nId_Usuario)
    );

    CREATE INDEX IX_staging_aval_usuario_supervisor
        ON staging.aval_usuario_current(source_code, nid_UsuSuper)
        INCLUDE
        (
            cUsr_NroDoc,
            cUsr_ApePat,
            cUsr_ApeMat,
            cUsr_Nombres,
            bEstado,
            nid_perfil,
            source_as_of_at
        );
END;
GO
