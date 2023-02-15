import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mascota from 'App/Models/Mascota'

export default class MascotasController {

    public async getListarMascotas(): Promise<Mascota[]> {
        const mascotas = await Mascota.all();
        return mascotas;
    }

    public async filtrarPorEspecie({request}: HttpContextContract){
        const especie = request.param('especie');
        const mascotas = await Mascota.query().where({'especie': especie});
        return mascotas;
    }

    public async filtrarPorEdad(): Promise<Mascota[]>{
        //Se obtienen las mascotas menores de 8 años
        const mascotas = await Mascota.query().where('edad', '<', 8);
        return mascotas;
    }

    public async updateMascota({request}: HttpContextContract){
        const id = request.param('id');
        const datos = request.all();
        const mascotaExistente: Number = await this.getValidarMascotaExistente(id);
        if(mascotaExistente !== 0){   
            const mascota = await Mascota.findOrFail(id);
            mascota.nombre_animal = datos.nombre_animal,
            mascota.especie =  datos.especie,
            mascota.raza = datos.raza,
            mascota.genero = datos.genero,
            mascota.edad = datos.edad,
            await mascota.save();
            return {"msg":"Mascota actualizada correctamente", "estado":200};
        }
        return {"msg":"No existe una mascota con este código", "estado":400};
    }

    public async deleteMascota({request}: HttpContextContract){
        const id = request.param('id');
        const mascotaExistente: Number = await this.getValidarMascotaExistente(id);
        if(mascotaExistente !== 0){   
            await Mascota.query().where({'codigo_animal': id}).delete();
            return {"mag": "Mascota eliminada","estado":200}
        }
        return {"msg":"No existe una mascota con este código", "estado":400};
    }

    public async setRegistrarMascotas({request, response}: HttpContextContract){
    
        const dataMascota = request.only(['codigo_animal', 'nombre_animal', 'especie',  'raza', 'genero', 'edad'])
        try{
          const codigoMascota = dataMascota.codigo_animal
          const mascotaExistente: Number = await this.getValidarMascotaExistente(codigoMascota)
          if(mascotaExistente === 0){
            await Mascota.create(dataMascota)
            response.status(200).json({"msg": "Registro completado con exito"})
          } else{
            response.status(400).json({"msg": "Este codigo de mascota ya se encuentra registrado"})
          }
        } catch(error){
          console.log(error)
          response.status(500).json({"msg": "Error en el servidor !"})
        }

    }
    
    private async getValidarMascotaExistente(codigo_animal: Number): Promise<Number>{
    const total = await Mascota.query().where({"codigo_animal":codigo_animal}).count('*').from('mascotas')
    return parseInt(total[0]["count(*)"])
    }

}
