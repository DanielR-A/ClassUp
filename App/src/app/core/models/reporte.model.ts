export interface ReporteCitasEstado {
    PENDIENTE: number;
    ACEPTADA: number;
    RECHAZADA: number;
    CANCELADA: number;
    COMPLETADA: number;
    total: number;
}

export interface ReporteCitasProfesional {
    profesionalId: number;
    nombre: string;
    totalCompletadas: number;
}

export interface ReporteCalificacionProfesional {
    profesionalId: number;
    nombre: string;
    promedio: number;
    totalResenas: number;
}

export interface ReporteFiltros {
    fechaDesde?: string;
    fechaHasta?: string;
    profesionalId?: number | null;
    categoriaId?: number | null;
}