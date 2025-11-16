import { config } from ".";
import axios from "axios";
export const uploadImage = async (formData) => {

	formData.append("upload_preset", config.VITE_CLOUD_UPLOAD_PRESET);
	return await axios.post(
		`https://api.cloudinary.com/v1_1/${config.VITE_CLOUD_NAME}/image/upload`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
}