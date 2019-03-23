const fs = require("fs");
class DeviconScript {
    constructor() {
        this.writeList = () => {
            const iconFileHeader = `import {${this.list.join()}} from "./Icon_functions"; import {IIcon} from "../Interfaces"; export const Icon: IIcon = {${this.list.join()}};`;
            fs.writeFile(`../roadskill-react-ts/src/Icons/Icon.tsx`, iconFileHeader, (err, data) => {
                if (err)
                    console.log(err);
            });
        };
        this.fileHeaderString =
            'import React, { SFC } from "react"; import styled from "styled-components"; const SVG = styled.svg` height: 24; width: 24; fill: #424242; stroke: #424242;`;';
        this.list = [];
        this.svgList = [];
        this.generate();
    }
    generate() {
        this.writeHeader().then(() => {
            this.writeList();
        });
    }
    chooseFile(files, resolve, folder) {
        const line = files.filter(file => file.match(/-line.svg$/))[0];
        const plain = files.filter(file => file.match(/-plain.svg$/))[0];
        if (line) {
            this.writeSVG("-line", line, resolve, folder);
        }
        else if (plain) {
            this.writeSVG("-plain", plain, resolve, folder);
        }
        else {
            const original = files.filter(file => file.match(/-original.svg$/))[0];
            if (original) {
                this.writeSVG("-original", original, resolve, folder);
            }
        }
    }
    getFileName(file, fileName) {
        const name = file
            .replace(".svg", "")
            .replace(fileName, "")
            .replace("-", "");
        return name;
    }
    buildPath(data) {
        let path = data.match(/(<path(.|\s)*?>)/g);
        if (!path)
            return;
        path = path.length > 1 ? path.join("") : path[0];
        const classMatch = path.match(/class=".*?"/g);
        if (classMatch) {
            path = path.replace(/class=".*?"/g, "");
        }
        const fill = path.match(/fill=".*?"/g);
        if (fill)
            path = path.replace(/fill=".*?"/g, "");
        path = path.replace(/clip-rule/g, "clipRule");
        path = path.replace(/fill-rule/g, "fillRule");
        return path;
    }
    writeHeader() {
        return new Promise((resolve, reject) => {
            fs.writeFile(`${this.projectLink}/src/Icons/Icon_functions.tsx`, this.fileHeaderString, (err, data) => {
                if (err)
                    console.log(err);
            });
            return fs.readdir("./devicon-master/icons", (err, folder) => {
                // for each folder get the files
                folder.forEach(folder => {
                    fs.readdir(`./devicon-master/icons/${folder}`, (err, files) => {
                        this.chooseFile(files, resolve, folder);
                    });
                });
            });
        });
    }
    writeSVG(fileName, file, resolve, folder) {
        fs.readFile(`../devicon-master/icons/${folder}/${file}`, "utf8", (err, data) => {
            if (err)
                throw err;
            const path = this.buildPath(data);
            const jsx = `<SVG viewBox="0 0 128 128" height="24" width="24">${path}</SVG>`;
            const name = this.getFileName(file, fileName);
            const dataToWrite = `export const ${name}: React.StatelessComponent<{}> = () => (${jsx})\n`;
            !this.list.includes(name)
                ? this.list.push(name) &&
                    fs.appendFile(`../roadskill-react-ts/src/Icons/Icon_functions.tsx`, dataToWrite, (err, data) => {
                        if (err)
                            console.log(err);
                        return this.list;
                    })
                : null;
        });
    }
}
new DeviconScript();
//# sourceMappingURL=devicon.js.map