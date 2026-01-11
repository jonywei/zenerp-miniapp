import os

# 定义需要抓取的文件类型
valid_exts = ['.uvue', '.js', '.json', '.scss', '.css', '.html']
# 定义忽略的目录（特别是 unpackage 和 git，太大且无用）
ignore_dirs = ['unpackage', '.hbuilderx', 'node_modules', '.git', 'dist']

output_file = 'frontend_code.txt'

print(f"开始扫描当前目录: {os.getcwd()} ...")

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        # 过滤忽略的目录
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            if any(file.endswith(ext) for ext in valid_exts):
                file_path = os.path.join(root, file)
                print(f"正在打包: {file_path}")
                
                # 写入文件名作为分隔符
                outfile.write(f'\n\n{"="*40}\nFILE: {file_path}\n{"="*40}\n\n')
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f'Error reading file: {e}')

print(f'\n✅ 打包完成！请将生成的 {output_file} 发送给我。')