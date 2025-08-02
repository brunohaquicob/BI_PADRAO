<?php

namespace App\View\Components;

use Carbon\Carbon;
use Illuminate\View\Component;

class DateRangePickerWithDefaults extends Component {
    public $id;
    public $eventName;
    public $options;
    public $type;
    public $label;
    public $icon;
    public $autoApply;
    public $single;
    /**
     * Create a new component instance.
     *
     * @param  string  $id
     * @param  string  $eventName
     * @param  array  $options
     * @param  string  $type
     * @param  string  $label
     * @param  string  $icon
     * @return void
     */
    public function __construct($id, $eventName, $options = [], $type = 'button', $single = 'N', $label = 'Data', $icon = 'far fa-calendar-alt', $autoApply = false) {
    
        $this->id = $id;
        $this->eventName = $eventName;
        $this->options = $options;
        $this->type = $type;
        $this->label = $label;
        $this->icon = $icon;
        $this->autoApply = $autoApply;
        $this->single = $single;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|string
     */
    public function render() {
        return view('components.calendario-component');
    }

    /**
     * Get the merged options combining the passed options with the default options.
     *
     * @return array
     */
    public function mergedOptions() {
        $defaultOptions = [
            'autoApply' => true,
            'ranges' => [
                'Hoje' => [Carbon::today(), Carbon::today()],
                'Ontem' => [Carbon::yesterday(), Carbon::yesterday()],
                'Últimos 7 dias' => [Carbon::today()->subDays(6), Carbon::today()],
                'Últimos 30 dias' => [Carbon::today()->subDays(29), Carbon::today()],
                'Este mês' => [Carbon::today()->startOfMonth(), Carbon::today()->endOfMonth()],
                'Último mês' => [
                    Carbon::today()->subMonth()->startOfMonth(),
                    Carbon::today()->subMonth()->endOfMonth()
                ]
            ],
            'startDate' => Carbon::today()->startOfWeek(),
            'endDate' => Carbon::today()
        ];

        return array_merge($defaultOptions, $this->options);
    }
}
