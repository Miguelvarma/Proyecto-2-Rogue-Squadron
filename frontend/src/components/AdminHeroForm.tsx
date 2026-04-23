import { useState } from "react";

export default function AdminHeroForm() {

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stars: "",
    type: ""
  });

  const [imagen, setImagen] = useState<File | null>(null);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stars", form.stars);
    formData.append("type", form.type);

    if (imagen) {
      formData.append("imagen", imagen);
    }

    const res = await fetch("http://localhost:3000/api/v1/heroes", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    alert("Héroe creado 🔥");
    console.log(data);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>

      <input name="name" placeholder="Nombre" onChange={handleChange} />
      <textarea name="description" placeholder="Descripción" onChange={handleChange} />

      <input name="price" type="number" placeholder="Precio" onChange={handleChange} />
      <input name="stars" type="number" placeholder="Estrellas (1-5)" onChange={handleChange} />

      <select name="type" onChange={handleChange}>
        <option value="">Tipo</option>
        <option value="tanque">Guerrero Tanque</option>
        <option value="armas">Guerrero Armas</option>
        <option value="fuego">Mago Fuego</option>
        <option value="hielo">Mago Hielo</option>
        <option value="veneno">Pícaro Veneno</option>
        <option value="machete">Pícaro Machete</option>
        <option value="chaman">Chamán</option>
        <option value="medico">Médico</option>
      </select>

      <input type="file" onChange={(e: any) => setImagen(e.target.files[0])} />

      <button type="submit">Guardar Héroe</button>

    </form>
  );
}