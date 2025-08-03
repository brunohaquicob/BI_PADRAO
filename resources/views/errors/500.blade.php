@extends('errors::minimal')

@section('title', 'Erro no Servidor')
@section('code', '500')
@section('message', session('custom_error') ?? 'Houve um erro interno ao processar sua solicitação.')

