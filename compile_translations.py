#!/usr/bin/env python
"""Compile .po files to .mo files using Python gettext module."""
import os
import gettext
import shutil

def compile_po_to_mo(po_path, mo_path):
    """Compile .po file to .mo file using gettext."""
    try:
        # Read .po file and parse it manually
        translations = {}
        with open(po_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        current_msgid = None
        current_msgstr = None
        in_msgid = False
        in_msgstr = False
        
        for line in lines:
            line = line.strip()
            if line.startswith('msgid "'):
                if current_msgid and current_msgstr:
                    translations[current_msgid] = current_msgstr
                current_msgid = line[7:-1]  # Remove msgid " and "
                current_msgstr = None
                in_msgid = True
                in_msgstr = False
            elif line.startswith('msgstr "'):
                current_msgstr = line[8:-1]  # Remove msgstr " and "
                in_msgid = False
                in_msgstr = True
            elif line.startswith('"') and line.endswith('"'):
                content = line[1:-1]
                if in_msgid:
                    current_msgid += content
                elif in_msgstr:
                    current_msgstr += content
        
        # Add last translation
        if current_msgid and current_msgstr:
            translations[current_msgid] = current_msgstr
        
        # Create .mo file using gettext format
        # We'll use a simpler approach - create a proper .mo file structure
        from io import BytesIO
        import struct
        
        # Filter out empty translations
        valid_translations = {k: v for k, v in translations.items() if k and v}
        
        if not valid_translations:
            print(f"No valid translations in {po_path}")
            return False
        
        # Build .mo file
        mo_data = BytesIO()
        
        # Write header
        mo_data.write(struct.pack('<I', 0x950412de))  # Magic number
        mo_data.write(struct.pack('<I', 0))  # Version
        mo_data.write(struct.pack('<I', len(valid_translations)))  # Number of strings
        
        # We'll write a simplified version that Django can read
        # For now, let's use gettext's built-in support if available
        # Otherwise, create minimal working .mo file
        
        # Calculate offsets
        header_size = 28
        table_size = len(valid_translations) * 8  # 2 * 4 bytes per entry
        original_offset = header_size
        translation_offset = original_offset + table_size
        
        # Write offsets
        mo_data.write(struct.pack('<I', original_offset))
        mo_data.write(struct.pack('<I', translation_offset))
        mo_data.write(struct.pack('<I', 0))  # Hash table size
        mo_data.write(struct.pack('<I', 0))  # Hash table offset
        
        # Write strings
        strings_data = BytesIO()
        original_entries = []
        translation_entries = []
        
        current_pos = translation_offset + table_size * 2
        
        for msgid, msgstr in sorted(valid_translations.items()):
            # Write original
            msgid_bytes = msgid.encode('utf-8') + b'\x00'
            strings_data.seek(current_pos - (translation_offset + table_size * 2))
            strings_data.write(msgid_bytes)
            original_entries.append((len(msgid_bytes), current_pos))
            current_pos += len(msgid_bytes)
            # Align to 4 bytes
            padding = (4 - (current_pos % 4)) % 4
            current_pos += padding
            
            # Write translation
            msgstr_bytes = msgstr.encode('utf-8') + b'\x00'
            strings_data.seek(current_pos - (translation_offset + table_size * 2))
            strings_data.write(msgstr_bytes)
            translation_entries.append((len(msgstr_bytes), current_pos))
            current_pos += len(msgstr_bytes)
            # Align to 4 bytes
            padding = (4 - (current_pos % 4)) % 4
            current_pos += padding
        
        # Write original table
        mo_data.seek(original_offset)
        for length, offset in original_entries:
            mo_data.write(struct.pack('<I', length))
            mo_data.write(struct.pack('<I', offset))
        
        # Write translation table
        mo_data.seek(translation_offset)
        for length, offset in translation_entries:
            mo_data.write(struct.pack('<I', length))
            mo_data.write(struct.pack('<I', offset))
        
        # Write strings
        mo_data.write(strings_data.getvalue())
        
        # Write to file
        with open(mo_path, 'wb') as f:
            f.write(mo_data.getvalue())
        
        print(f"Successfully compiled {po_path} -> {mo_path} ({len(valid_translations)} translations)")
        return True
        
    except Exception as e:
        print(f"Error compiling {po_path}: {e}")
        import traceback
        traceback.print_exc()
        return False

# Alternative: Use polib if available, otherwise use manual method
try:
    import polib
    USE_POLIB = True
except ImportError:
    USE_POLIB = False
    print("polib not available, using manual compilation")

if USE_POLIB:
    # Use polib for proper compilation
    for lang in ['ru', 'en', 'de']:
        po_path = f'locale/{lang}/LC_MESSAGES/django.po'
        mo_path = f'locale/{lang}/LC_MESSAGES/django.mo'
        if os.path.exists(po_path):
            try:
                po = polib.pofile(po_path)
                po.save_as_mofile(mo_path)
                print(f"Compiled {po_path} -> {mo_path} using polib ({len(po)} entries)")
            except Exception as e:
                print(f"Error with polib: {e}, using manual method")
                compile_po_to_mo(po_path, mo_path)
else:
    # Use manual compilation
    success_count = 0
    for lang in ['ru', 'en', 'de']:
        po_path = f'locale/{lang}/LC_MESSAGES/django.po'
        mo_path = f'locale/{lang}/LC_MESSAGES/django.mo'
        if os.path.exists(po_path):
            if compile_po_to_mo(po_path, mo_path):
                success_count += 1
        else:
            print(f"Warning: {po_path} not found")
    
    print(f"\nCompiled {success_count} translation files")
