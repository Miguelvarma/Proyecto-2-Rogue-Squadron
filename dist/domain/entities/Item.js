"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const uuid_1 = require("uuid");
class Item {
    constructor(props) {
        this.id = props.id || (0, uuid_1.v4)();
        this.nombre = props.nombre;
        this.tipo = props.tipo;
        this.rareza = props.rareza || 'Común';
        this.imagen = props.imagen || null;
        this.descripcion = props.descripcion || '';
        this.habilidades = props.habilidades || [];
        this.efectos = props.efectos || [];
        this.ataque = props.ataque || 0;
        this.defensa = props.defensa || 0;
        this.userId = props.userId || null;
        this.enSubasta = props.enSubasta || false;
        this.enMazoActivo = props.enMazoActivo || false;
        this.activo = props.activo !== undefined ? props.activo : true;
        this.deletedAt = props.deletedAt || null;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
        this.validate();
    }
    validate() {
        if (!this.nombre || this.nombre.trim().length < 2) {
            throw new Error('Nombre del ítem debe tener al menos 2 caracteres');
        }
        const tiposValidos = ['Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica'];
        if (!tiposValidos.includes(this.tipo)) {
            throw new Error(`Tipo debe ser uno de: ${tiposValidos.join(', ')}`);
        }
    }
    canBeDeleted() {
        if (this.enSubasta) {
            throw new Error('No se puede eliminar un ítem en subasta');
        }
        if (this.enMazoActivo) {
            throw new Error('No se puede eliminar un ítem en mazo activo');
        }
        if (!this.activo) {
            throw new Error('El ítem ya está eliminado');
        }
    }
    markAsDeleted() {
        this.canBeDeleted();
        this.activo = false;
        this.deletedAt = new Date();
    }
    belongsTo(userId) {
        return this.userId === userId;
    }
    toPublic() {
        return {
            id: this.id,
            nombre: this.nombre,
            tipo: this.tipo,
            rareza: this.rareza,
            imagen: this.imagen,
            descripcion: this.descripcion,
            habilidades: this.habilidades,
            efectos: this.efectos,
            ataque: this.ataque,
            defensa: this.defensa,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    toPersistence() {
        return {
            id: this.id,
            nombre: this.nombre,
            tipo: this.tipo,
            rareza: this.rareza,
            imagen: this.imagen || undefined,
            descripcion: this.descripcion,
            habilidades: this.habilidades,
            efectos: this.efectos,
            ataque: this.ataque,
            defensa: this.defensa,
            userId: this.userId || undefined,
            enSubasta: this.enSubasta,
            enMazoActivo: this.enMazoActivo,
            activo: this.activo,
            deletedAt: this.deletedAt || undefined,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
    static fromPersistence(data) {
        return new Item(data);
    }
}
exports.Item = Item;
