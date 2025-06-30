import supabase from "./supabase";

export async function uploadToSupabase(file: File, bucket: string) {
    console.log("Fie:", file);
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(file.name, file, {
      cacheControl: '3600',
      upsert: true,
    });
    console.log(data);

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  return data;
}