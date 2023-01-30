import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { Usuario } from 'src/app/classes/usuario';
import { Empresa } from 'src/app/interface/EmpresaApi/empresa';
import { Endereco } from 'src/app/interface/EmpresaApi/endereco';
import { Municipio } from 'src/app/interface/LocalidadesApi/Cidades/municipio';
import { Uf } from 'src/app/interface/LocalidadesApi/Estados/uf';
import { EmpresaService } from 'src/app/services/empresa.service';
import { LocalidadesService } from 'src/app/services/localidades.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { ViacepService } from 'src/app/services/viacep.service';

@Component({
  selector: 'app-alteracao',
  templateUrl: './alteracao.component.html',
  styleUrls: ['./alteracao.component.css']
})
export class AlteracaoComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empresaService: EmpresaService,
    private viacep: ViacepService,
    private localidades: LocalidadesService,
    private usuariosService: UsuariosService) { }

  storage: Storage = localStorage;
  empresa!: Empresa;
  endereco!: Endereco;
  estados!: Uf[];
  cidades!: Municipio[];
  user: Usuario = new Usuario();
  senha!: string;
  userLogado!: string;

  ngOnInit(): void {
    this.userLogado = this.storage.getItem("user_name") as string;

    if (this.userLogado.length == 14) {
      this.empresaService.getEmpresaPorCnpj(this.userLogado).subscribe(
        resp => {
          this.empresa = resp;
          this.endereco = this.empresa.enderecoInfo as Endereco;
        }
      );
      this.usuariosService.getUsuarioCnpj(this.userLogado).subscribe(resp => {
        this.user = resp;
      })
      this.listarEstados();
    } else {
      let idempresa = this.route.snapshot.paramMap.get("id") as string;
      this.empresaService.getEmpresaPorId(idempresa).subscribe(
        resp => {
          this.empresa = resp;
          this.endereco = this.empresa.enderecoInfo as Endereco;
        }
      );
      this.listarEstados()
    }
  }

  Alterar(empresa: Empresa): void {
    this.empresaService.putEmpresa(empresa).subscribe(() => {
      this.voltar();
    }, error => this.router.navigate(["/erro"]));

    this.usuariosService.putUsuario(this.user).subscribe(resp => this.user = resp);
  }

  preencherEnderecoPorCep(cep: string): void {
    this.viacep.getEnderecoPorCep(cep).subscribe(resposta => {
      this.endereco = {
        logradouro: resposta.logradouro, cidade: resposta.localidade, uf: resposta.uf, cep: this.endereco.cep, numero: this.endereco.numero
      };
      this.listarMunicipiosPorUf(this.endereco.uf);
    });
  }

  listarEstados(): void {
    this.localidades.getEstados().subscribe(resposta => this.estados = resposta);
  }

  listarMunicipiosPorUf(uf: string): void {
    this.localidades.getMunicipiosPorUf(uf).subscribe(resposta => this.cidades = resposta);
  }

  mostrarSenha(): void {
    const inputSenha = document.getElementById('senha');
    if (inputSenha?.getAttribute('type') == 'password') {
      inputSenha?.setAttribute("type", "text");
    } else {
      inputSenha?.setAttribute("type", "password");
    }
  }

  voltar(): void {
    this.userLogado.length == 14 ? this.router.navigate(["/painelEmpresa"]) : this.router.navigate(["/painelAdministrativo"])
  }
}
