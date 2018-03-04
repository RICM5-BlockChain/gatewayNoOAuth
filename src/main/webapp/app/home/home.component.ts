import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as crypto from 'crypto-js';
import * as sjcl from 'sjcl';

import { Account, LoginModalService, Principal } from '../shared';
import { read } from 'fs';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: [
        'home.css',
        'dragndrop.css'
    ]
})

export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;
    file: File;
    filename: String;
    filesize: String;
    transactionId: '';
    sha_calculated: String;
    error_message = 'Please provide an ID';
    error = '';
    reader = new FileReader();
    queryUrl = 'http://www.mocky.io/v2/5a9bd9e23400002c00a39b06';

    constructor(
        private principal: Principal,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        private http: HttpClient
    ) {
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    idModified(id) {
        if (id !== '') {
            this.error = '';
        } else {
            this.error = this.error_message;
        }
    }

    public updateSha(event) {
        console.log('shaUpdate');
        this.sha_calculated = crypto.SHA256(
            crypto.enc.Latin1.parse(event.target.result))
            .toString(crypto.enc.Hex);
        console.log(this.sha_calculated);
        const elem = document.getElementById('sha-calculated');
        elem.innerHTML = '<p> SHA : ' + this.sha_calculated + '</p>';
        const response = this.http.get('http://www.mocky.io/v2/5a9bdba63400005b00a39b09').subscribe((res) => {
            console.log(res);
        });
    }

    fileSelected(file) {
        console.log('coucou');
        console.log(file);
        this.file = file;
        this.filesize = file.size;
        document.getElementById('filename').innerHTML = (<string>this.filename);
        document.getElementById('filesize').innerHTML = (<string>this.filesize);
        this.filename = file.name;
        this.reader.onload = this.updateSha;
        this.reader.readAsBinaryString(file);
    }

    dragHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        const drop_area = document.getElementById('drop_area');
        drop_area.className = 'area drag';
    }

    filesDroped(event) {
        let files = Array();
        try {
            event.stopPropagation();
            event.preventDefault();
            files = event.dataTransfer.files;
            const file = files[0];
            console.log('avant');
            console.log(file);
            this.file = file;
            this.filename = file.name;
            this.filesize = file.size;
            document.getElementById('filename').innerHTML = (<string>this.filename);
            document.getElementById('filesize').innerHTML = (<string>this.filesize);
            const updateSha = function(e) {
                console.log('shaUpdate');
                this.sha_calculated = crypto.SHA256(
                    crypto.enc.Latin1.parse(e.target.result))
                    .toString(crypto.enc.Hex);
                console.log(this.sha_calculated);
                const elem = document.getElementById('sha-calculated');
                elem.innerHTML = '<p> SHA : ' + this.sha_calculated + '</p>';
            };
            const reader2 = new FileReader();
            reader2.onload = updateSha;
            reader2.readAsBinaryString(file);
            // this.reader.onload = this.updateSha;
            // this.reader.readAsBinaryString(file);
            console.log('apres');
        } catch (e) {
            console.log('error in file transfer');
        }
        const drop_area = document.getElementById('drop_area');
        drop_area.className = 'area';
        for (let i = 0; i < files.length; i++) {
            const toType = function(obj) {
                return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
            };
        }
    }

    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        });
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.registerAuthenticationSuccess();
        this.error = this.error_message;
        const drop_area = document.getElementById('drop_area');
        drop_area.addEventListener('dragover', this.dragHandler);
        drop_area.addEventListener('drop', this.filesDroped);
        this.http.get('/microservicenooauth/api/getDigest?Transaction=1').subscribe((res) => {
            console.log(res);
        });
    }
}
