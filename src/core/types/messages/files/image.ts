export interface ImageMeta {
    id:         string;
    name:       string;
    mime_type:  string;
}

export interface ImagePart {
    asset_pointer:  string;
    content_type:   'image_asset_pointer';
}