const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

//middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor de tareas funcionando');
});

//middleware de autenticación para que solo los usuarios autenticados puedan acceder a las rutas de tareas
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'password123') {
        next(); // Si el token es correcto, permite el paso
    } else {
        res.status(401).json({ mensaje: 'Error: Autenticación fallida' });
    }
};

//ruta para obtener todos las tareas
app.get('/tareas', authMiddleware, (req, res) => {
    fs.readFile('tareas.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer las tareas' });
        }
        const tasks = JSON.parse(data);
        res.json({ mensaje: 'Tareas obtenidas exitosamente', data: tasks });
    });
});

//ruta para agregar una nueva tarea
app.post('/tareas', authMiddleware, (req, res) => {
    const nuevaTarea = req.body;
    fs.readFile('tareas.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer las tareas' });
        }
        const tasks = JSON.parse(data);
        tasks.push(nuevaTarea);
        fs.writeFile('tareas.json', JSON.stringify(tasks), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar la tarea' });
            }
            res.status(201).json({ mensaje: 'Tarea agregada exitosamente', data: nuevaTarea });
        });
    });
});

//ruta para eliminar una tarea por su id
app.delete('/tareas/:id', authMiddleware, (req, res) => {
    const tareaId = req.params.id;
    fs.readFile('tareas.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error al leer' });
        let tasks = JSON.parse(data || '[]');
        const nuevasTareas = tasks.filter(tarea => tarea.id != tareaId);
        fs.writeFile('tareas.json', JSON.stringify(nuevasTareas, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Error al eliminar' });
            res.json({ mensaje: 'Tarea eliminada exitosamente' });
        });
    });
});


//ruta para actualizar una tarea por su id
app.put('/tareas/:id', authMiddleware, (req, res) => {
    const tareaId = req.params.id;
    const tareaActualizada = req.body;
    fs.readFile('tareas.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error al leer' });
        let tasks = JSON.parse(data || '[]');
        const index = tasks.findIndex(tarea => tarea.id == tareaId);
        if (index === -1) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        tasks[index] = { ...tasks[index], ...tareaActualizada };
        fs.writeFile('tareas.json', JSON.stringify(tasks, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Error al actualizar' });
            res.send('Tarea actualizada exitosamente');
        });
    });
});


// iniciar el servidor

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});