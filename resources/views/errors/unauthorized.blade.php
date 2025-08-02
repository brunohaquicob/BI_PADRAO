@extends('adminlte::page')

@section('title', 'Acesso Não Autorizado')

@section('content_header')
    {{-- <h1>Acesso não autorizado</h1> --}}
@stop

@section('content')
    <h5 class="mt-4 mb-2 text-center">&nbsp</h5>
    <div class="card card-default">
        <div class="card-header">
            <div class="row">
                <div class="col-md-12">
                    <div class="card-tools">
                        <a class="btn btn-block btn-outline-dark btn-lg" href="{{ route('home') }}">Ir para a Home</a>
                        <a class="btn btn-block btn-outline-dark btn-lg" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" href="#">Encerrar Sessão</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-body text-center">
            <div class="row">
                <div class="col-md-12">
                    <div class="alert alert-warning alert-dismissible">
                        <h5><i class="fas fa-bullhorn"></i> ACESSO NÃO AUTORIZADO </h5>
                        @if ($errors->has('error'))
                            {{ $errors->first('error') }}
                        @elseif ($errors->has('acesso') && $errors->first('acesso') === 'B')
                            Usuário com <b>Acesso Bloqueado</b>, contate o administrador do sistema!
                        @elseif ($errors->has('acesso') && $errors->first('acesso') === 'N')
                            Usuário com <b>Acesso Desativado</b>, contate o administrador do sistema!
                        @else
                            <script>window.location.href = "{{ route('home') }}";</script>
                        @endif
                    </div>
                </div>
            </div>
        </div>

    </div>

@stop
