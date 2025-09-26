// netlify/functions/gemini.js

export default async (req, context) => {
    // Solo permite peticiones POST
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
    }

    try {
        // Obtiene la clave de API desde las variables de entorno de Netlify (más seguro)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("La clave de API de Gemini no está configurada en el servidor.");
        }

        const { numero, texto } = await req.json();
        if (!numero || !texto) {
            return new Response(JSON.stringify({ error: 'Faltan el número o el texto del artículo.' }), { status: 400 });
        }
        
        const systemPrompt = "Actúa como un experto en derecho constitucional venezolano. Explica el siguiente artículo de la Constitución de Venezuela en un lenguaje sencillo y claro, como si se lo explicaras a un estudiante de secundaria o a alguien sin conocimientos legales. El objetivo es que sea fácil de entender, destacando sus puntos más importantes y su impacto en la vida de los ciudadanos. No agregues opiniones personales, solo una interpretación didáctica y objetiva. Formatea la respuesta en párrafos claros y concisos, usando markdown para negritas si es necesario.";
        const userQuery = `Por favor, interpreta el siguiente artículo:\n\n**Artículo ${numero}**: "${texto}"`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error("Error desde la API de Gemini:", errorBody);
            throw new Error(`La API de Gemini respondió con un error: ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        const interpretation = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!interpretation) {
             throw new Error("No se recibió una interpretación válida de la API de Gemini.");
        }

        return new Response(JSON.stringify({ interpretation }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error en la función del servidor:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};