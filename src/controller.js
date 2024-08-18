import {pool} from './database.js';

class LibroController{

    async getAll(req, res) {
        const [result] = await pool.query('SELECT * FROM libros');
        res.json(result);
    }

    //para ver la informacion del libro segun su id es buscar en la url http://localhost:4000/libro/(id del libro)
    async getOne(req, res) {
        const { id } = req.params;
        const [result] = await pool.query('SELECT * FROM libros WHERE id = ?', [id]);
        if (result.length > 0) {
            res.json(result[0]); 
        } else {
            res.status(404).json({ message: 'Libro no encontrado' });
        }
    }
    
    async add(req, res) {
        try {
            const libro = req.body;
            const atributosValidos = ['nombre', 'autor', 'categoria', 'publicacion', 'ISBN'];

            // Validar si hay atributos no permitidos
            for (const key in libro) {
                if (!atributosValidos.includes(key)) {
                    throw new Error(`Atributo inválido: ${key} no forma parte del modelo de datos`);
                }
            }

            const [result] = await pool.query('INSERT INTO libros(nombre, autor, categoria, publicacion, ISBN) VALUES (?, ?, ?, ?, ?)', 
            [libro.nombre, libro.autor, libro.categoria, libro.publicacion, libro.ISBN]);
            res.json({ "id insertado": result.insertId });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { ISBN } = req.body;
            const [exists] = await pool.query('SELECT * FROM libros WHERE ISBN = ?', [ISBN]);

            if (exists.length === 0) {
                throw new Error('No se puede eliminar: ISBN no encontrado');
            }

            const [result] = await pool.query('DELETE FROM libros WHERE ISBN = ?', [ISBN]);
            res.json({ "Registros eliminados": result.affectedRows });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const libro = req.body;
            const { id } = libro;
    
            // Verificar si el libro con el ID dado existe
            const [existingBook] = await pool.query('SELECT * FROM libros WHERE id = ?', [id]);
    
            if (existingBook.length === 0) {
                return res.status(404).json({ message: 'Libro no encontrado con el ID proporcionado' });
            }
    
            // Si el libro existe, proceder con la actualización
            const [result] = await pool.query('UPDATE libros SET nombre = ?, autor = ?, categoria = ?, publicacion = ?, ISBN = ? WHERE id = ?', 
            [libro.nombre, libro.autor, libro.categoria, libro.publicacion, libro.ISBN, id]);
    
            res.json({ "Registros actualizados": result.affectedRows });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el libro' });
        }
    }

}

export const libro = new LibroController();