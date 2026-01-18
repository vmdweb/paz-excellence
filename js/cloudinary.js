/**
 * Cloudinary Upload Module
 * Handles file uploads to Cloudinary using unsigned presets
 */

const CLOUDINARY_CONFIG = {
    cloudName: 'dodnqnyof',
    imagePreset: 'covers_unsigned',
    audioPreset: 'audio_unsigned',
    jsonPreset: 'json_unsigned',
    uploadUrl: 'https://api.cloudinary.com/v1_1/dodnqnyof/upload'
};

/**
 * Upload image to Cloudinary
 */
async function uploadImageToCloudinary(file, onProgress) {
    return uploadFileToCloudinary(file, 'image', CLOUDINARY_CONFIG.imagePreset, onProgress);
}

/**
 * Upload audio to Cloudinary
 */
async function uploadAudioToCloudinary(file, onProgress) {
    return uploadFileToCloudinary(file, 'video', CLOUDINARY_CONFIG.audioPreset, onProgress);
}

/**
 * Upload JSON to Cloudinary (overwrite)
 */
async function uploadJSONToCloudinary(jsonData, publicId) {
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    formData.append("file", blob, "tracks.json");
    formData.append("upload_preset", CLOUDINARY_CONFIG.jsonPreset);
    formData.append("public_id", publicId);
    formData.append("resource_type", "raw");

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`;
    const response = await fetch(url, { method: "POST", body: formData });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Cloudinary JSON upload error");
    }

    const data = await response.json();
    return data.secure_url;
}

/**
 * Generic file upload
 */
async function uploadFileToCloudinary(file, type, preset, onProgress) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", preset);
        if (type === 'video') formData.append("resource_type", "video");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${type}/upload`);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const progress = Math.round((e.loaded / e.total) * 100);
                onProgress(progress);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const res = JSON.parse(xhr.responseText);
                    resolve(res.secure_url);
                } catch (err) {
                    reject(new Error('Failed to parse Cloudinary response'));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
    });
}
