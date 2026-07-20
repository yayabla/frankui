// Helper to retrieve a fast file identifier for preview matching
function getFileIdentifier(file) {
    return `${file.name}-${file.size}-${file.lastModified}`;
}


// Helper to retrieve beautiful file-type icons based on extension
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    let color = '#888888';
    let label = 'FILE';

    switch (ext) {
        case 'pdf':
            color = '#dc3545';
            label = 'PDF';
            break;
        case 'doc':
        case 'docx':
        case 'odt':
            color = '#0078d7';
            label = 'DOC';
            break;
        case 'xls':
        case 'xlsx':
        case 'ods':
        case 'csv':
            color = '#28a745';
            label = 'XLS';
            break;
        case 'ppt':
        case 'pptx':
        case 'odp':
            color = '#fd7e14';
            label = 'PPT';
            break;
        case 'txt':
        case 'md':
        case 'log':
        case 'json':
        case 'xml':
            color = '#6c757d';
            label = 'TXT';
            break;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            color = '#ffc107';
            label = 'ZIP';
            break;
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'm4a':
            color = '#6f42c1';
            label = 'AUD';
            break;
        case 'mp4':
        case 'mkv':
        case 'avi':
        case 'mov':
            color = '#17a2b8';
            label = 'VID';
            break;
        case 'sh':
        case 'bash':
        case 'bat':
        case 'cmd':
            color = '#00cc00';
            label = 'SH';
            break;
    }

    return `<svg class="file-icon" viewBox="0 0 24 24" width="48" height="48" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><text x="12" y="17" font-size="5.5" font-weight="bold" fill="${color}" stroke="none" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${label}</text></svg>`;
}

const FileUploader = {
    init: function() {
        document.querySelectorAll('input[data-role="file"]').forEach(input => {
            if (input.dataset.initialized) return;
            input.dataset.initialized = 'true';
            input._selectedFiles = new Map();

            // Auto-load constraints from accept attribute if present
            if (input.getAttribute('accept')) {
                input._allowedMimeTypes = input.getAttribute('accept').split(',').map(s => s.trim());
            }

            input.addEventListener('change', (e) => {
                // If the event was triggered programmatically by our sync step, do nothing
                if (e.detail && e.detail.isSync) return;

                const maxSize = input.dataset.maxSize ? parseInt(input.dataset.maxSize) : null;
                const previewContainer = input.closest('.file-input-wrapper').querySelector('.file-preview');

                let filesAdded = false;
                if (!input.multiple) {
                    input._selectedFiles.clear();
                    previewContainer.innerHTML = '';
                }

                // Copy target files to a synchronous array
                const files = Array.from(e.target.files);

                for (const file of files) {
                    if (maxSize && file.size > maxSize) {
                        alert(`File ${file.name} is too large!`);
                        continue;
                    }

                    // Validate MIME type or file extension
                    if (input._allowedMimeTypes && input._allowedMimeTypes.length > 0) {
                        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
                        const isAllowed = input._allowedMimeTypes.some(type => {
                            if (type.endsWith('/*')) {
                                return file.type.startsWith(type.slice(0, -2));
                            }
                            return file.type === type || fileExt === type.toLowerCase();
                        });
                        if (!isAllowed) {
                            alert(`File "${file.name}" is not an allowed format.`);
                            continue;
                        }
                    }

                    const hash = getFileIdentifier(file);
                    if (input._selectedFiles.has(hash)) {
                        continue; // Skip duplicates silently
                    }

                    input._selectedFiles.set(hash, file);
                    filesAdded = true;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const item = document.createElement('div');
                        item.className = 'file-preview-item';
                        item.dataset.hash = hash;
                        
                        // Append media preview (image or icon)
                        if (file.type.startsWith('image/')) {
                            const img = document.createElement('img');
                            const result = event.target.result;
                            if (typeof result === 'string' && result.startsWith('data:image/')) {
                                img.src = result;
                            }
                            item.appendChild(img);
                        } else {
                            const iconWrapper = document.createElement('div');
                            iconWrapper.innerHTML = getFileIcon(file.name);
                            const svgNode = iconWrapper.firstElementChild;
                            if (svgNode) {
                                item.appendChild(svgNode);
                            }
                        }

                        // Append file name paragraph
                        const p = document.createElement('p');
                        p.style.fontSize = '10px';
                        p.style.overflow = 'hidden';
                        p.style.whiteSpace = 'nowrap';
                        p.style.textOverflow = 'ellipsis';
                        p.style.margin = '4px 0 0 0';
                        p.textContent = file.name;
                        item.appendChild(p);

                        // Append remove button
                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'remove-btn';
                        removeBtn.type = 'button';
                        removeBtn.textContent = '×';
                        removeBtn.onclick = (e) => {
                            e.preventDefault();
                            FileUploader.removeFile(hash, removeBtn);
                        };
                        item.appendChild(removeBtn);

                        previewContainer.appendChild(item);
                    };
                    reader.readAsDataURL(file);
                }

                if (filesAdded && window.DataTransfer) {
                    const dt = new DataTransfer();
                    input._selectedFiles.forEach(f => dt.items.add(f));
                    input.files = dt.files;
                }
            });
        });
    },

    removeFile: function(hash, btn) {
        const item = btn.closest('.file-preview-item');
        if (!item) return;

        const wrapper = btn.closest('.file-input-wrapper');
        const input = wrapper.querySelector('input[type="file"]');

        if (input && input._selectedFiles) {
            input._selectedFiles.delete(hash);

            if (window.DataTransfer) {
                const dt = new DataTransfer();
                input._selectedFiles.forEach(file => dt.items.add(file));
                input.files = dt.files;
            }
            
            // Dispatch event to signify changes, with flag to avoid cycles
            input.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { isSync: true } }));
        }

        item.remove();
    },

    getFiles: function(input) {
        if (!input) return [];
        if (input._selectedFiles) {
            return Array.from(input._selectedFiles.values());
        }
        return Array.from(input.files || []);
    },

    getFormData: function(input, fieldName = 'files[]') {
        const formData = new FormData();
        const files = this.getFiles(input);
        files.forEach(file => {
            formData.append(fieldName, file);
        });
        return formData;
    },

    setImagesOnly: function(input) {
        if (!input) return;
        input.setAttribute('accept', 'image/*');
        input._allowedMimeTypes = ['image/*'];
    },

    setMimeTypes: function(input, types) {
        if (!input || !Array.isArray(types)) return;
        const acceptStr = types.join(',');
        input.setAttribute('accept', acceptStr);
        input._allowedMimeTypes = types;
    }
};

window.FileUploader = FileUploader;

